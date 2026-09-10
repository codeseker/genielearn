import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { z } from 'zod';
import { LLMService } from '../../llm/service/llm.service.js';
import { ConceptService } from '../../concepts/services/concepts.service.js';
import { PrerequisiteService } from '../../concepts/services/prerequsite.service.js';
import { LearningGoalService } from '../../learning/service/learning-goal.service.js';

const curriculumExtractionOutputSchema = z.object({
  concepts: z
    .array(
      z.object({
        name: z.string().min(2).max(100),
        description: z.string().max(500).optional(),
        domain: z.string().max(100).optional(),
        difficulty: z.number().min(1).max(5).optional(),
      }),
    )
    .max(30),
  edges: z
    .array(
      z.object({
        concept: z.string(),
        prerequisite: z.string(),
      }),
    )
    .max(60),
});

interface CurriculumAnalysisResult {
  goalId: string;
  resolvedConceptIds: string[];
  edgesCreated: number;
  edgesSkippedDuplicate: number;
  edgesSkippedCycle: number;
  edgesUnresolved: {
    concept: string;
    prerequisite: string;
    reason: string;
  }[];
}

@Injectable()
export class CurriculumAgentService {
  constructor(
    private readonly llmService: LLMService,
    private readonly conceptService: ConceptService,
    private readonly prerequisiteService: PrerequisiteService,
    private readonly learningGoalService: LearningGoalService,
  ) {}

  async analyzeGoal(goalId: string): Promise<CurriculumAnalysisResult> {
    // 1. Load the goal
    const goal = await this.learningGoalService.findById(goalId);

    // 2. Load existing concepts for context (cap at 200, project just name/slug)
    const existingConcepts = await this.conceptService.findMany({}, { limit: 200 });

    // 3. Build user input
    const existingConceptNames = existingConcepts
      .map((c) => c.name)
      .join('\n');
    const userInput = [
      `Learning Goal: ${goal.title}`,
      `Description: ${goal.description ?? 'No description provided'}`,
      '',
      'Existing concepts in the system:',
      existingConceptNames || '(none)',
      '',
      'Please propose concepts and prerequisite relationships to teach this goal. Reuse existing concept names exactly where they apply.',
    ].join('\n');

    // 4. Call LLM
    const result = await this.llmService.callStructured({
      agent: 'curriculum-agent',
      promptId: 'curriculum-extraction',
      systemPrompt:
        'You are a curriculum designer. Given a learner\'s goal and a list of concepts that already exist in the system, propose the concepts needed to teach this goal and the prerequisite relationships between them. Reuse existing concept names exactly where they already cover what\'s needed — only propose new concepts for genuine gaps. Keep prerequisite chains realistic and avoid redundant edges.',
      userInput,
      outputSchema: curriculumExtractionOutputSchema,
      goalId,
    });

    // 5. Validation gate — resolve concepts first
    const nameToIdMap = new Map<string, string>();

    for (const item of result.concepts) {
      const resolved = await this.conceptService.resolveOrCreate({
        name: item.name,
        description: item.description ?? null,
        domain: item.domain ?? null,
        difficulty: item.difficulty ?? null,
      });
      nameToIdMap.set(item.name.toLowerCase().trim(), resolved.id);
    }

    // 6. Validation gate — resolve and create edges
    const edgesCreated = 0;
    const edgesSkippedDuplicate = 0;
    const edgesSkippedCycle = 0;
    const edgesUnresolved: CurriculumAnalysisResult['edgesUnresolved'] = [];

    let createdCount = 0;
    let duplicateCount = 0;
    let cycleCount = 0;

    for (const edge of result.edges) {
      const conceptName = edge.concept.toLowerCase().trim();
      const prereqName = edge.prerequisite.toLowerCase().trim();

      let conceptId = nameToIdMap.get(conceptName);
      let prerequisiteId = nameToIdMap.get(prereqName);

      // Resolve concept if not in map
      if (!conceptId) {
        try {
          const resolved = await this.conceptService.resolveOrCreate({
            name: edge.concept,
          });
          conceptId = resolved.id;
          nameToIdMap.set(conceptName, conceptId);
        } catch {
          edgesUnresolved.push({
            concept: edge.concept,
            prerequisite: edge.prerequisite,
            reason: 'Could not resolve concept',
          });
          continue;
        }
      }

      // Resolve prerequisite if not in map
      if (!prerequisiteId) {
        try {
          const resolved = await this.conceptService.resolveOrCreate({
            name: edge.prerequisite,
          });
          prerequisiteId = resolved.id;
          nameToIdMap.set(prereqName, prerequisiteId);
        } catch {
          edgesUnresolved.push({
            concept: edge.concept,
            prerequisite: edge.prerequisite,
            reason: 'Could not resolve prerequisite',
          });
          continue;
        }
      }

      // Create the edge
      try {
        await this.prerequisiteService.create({
          conceptId,
          prerequisiteConceptId: prerequisiteId,
          metadata: {},
        });
        createdCount++;
      } catch (err) {
        if (err instanceof ConflictException) {
          duplicateCount++;
        } else if (err instanceof BadRequestException) {
          // Cycle detected
          cycleCount++;
        } else if (err instanceof NotFoundException) {
          // This should not happen if resolution worked correctly
          throw err;
        }
      }
    }

    // 7. Build result
    const resolvedConceptIds = Array.from(nameToIdMap.values());

    return {
      goalId,
      resolvedConceptIds,
      edgesCreated: createdCount,
      edgesSkippedDuplicate: duplicateCount,
      edgesSkippedCycle: cycleCount,
      edgesUnresolved,
    };
  }
}
