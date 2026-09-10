/**
 * Seed script for prompt_versions.
 *
 * Must be run before the curriculum-agent can work, since
 * PromptVersionService.getActiveVersion() throws NotFoundException if no
 * ACTIVE version exists for the given promptId/agent combination.
 *
 * Run with: npm run build && node dist/seed-prompts.js
 *
 * This script is idempotent — if an ACTIVE version already exists for
 * 'curriculum-extraction', it logs that and skips.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { PromptVersionService } from './module/prompts/service/promptVersion.service.js';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const promptVersionService = app.get(PromptVersionService);

    // Check if already seeded
    const existingVersions = await promptVersionService.listVersions(
      'curriculum-extraction',
    );

    const activeVersion = existingVersions.find(
      (v: { status: string }) => v.status === 'ACTIVE',
    );

    if (activeVersion) {
      console.log(
        `Prompt version for 'curriculum-extraction' already ACTIVE (id: ${activeVersion._id}, version: ${activeVersion.version}). Skipping seed.`,
      );
      return;
    }

    console.log('Seeding prompt_versions for curriculum-agent...');

    const promptVersion = await promptVersionService.create({
      promptId: 'curriculum-extraction',
      agent: 'curriculum-agent',
      systemPrompt: `You are a curriculum designer. Given a learner's goal and a list of concepts that already exist in the system, propose the concepts needed to teach this goal and the prerequisite relationships between them. Reuse existing concept names exactly where they already cover what's needed — only propose new concepts for genuine gaps. Keep prerequisite chains realistic and avoid redundant edges.`,
      outputSchema: {
        type: 'object',
        properties: {
          concepts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 2, maxLength: 100 },
                description: {
                  type: 'string',
                  maxLength: 500,
                },
                domain: { type: 'string', maxLength: 100 },
                difficulty: {
                  type: 'number',
                  minimum: 1,
                  maximum: 5,
                },
              },
              required: ['name'],
            },
            maxItems: 30,
          },
          edges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                concept: { type: 'string' },
                prerequisite: { type: 'string' },
              },
              required: ['concept', 'prerequisite'],
            },
            maxItems: 60,
          },
        },
        required: ['concepts', 'edges'],
      },
      model: 'claude-sonnet-4-6',
      configuration: {},
    });

    console.log(
      `Created prompt version: ${promptVersion._id} (version: ${promptVersion.version})`,
    );

    await promptVersionService.activate(promptVersion._id.toString());

    console.log(
      `Activated prompt version. Seeding complete! Active version id: ${promptVersion._id}`,
    );
  } finally {
    await app.close();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
