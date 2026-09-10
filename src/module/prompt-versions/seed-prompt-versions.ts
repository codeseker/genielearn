/**
 * One-off seed script to initialize prompt_versions for the curriculum-agent.
 *
 * Run with: npm run build && node dist/module/prompt-versions/seed-prompt-versions.js
 *
 * This MUST be run before the curriculum-agent can work, since
 * PromptVersionService.getActiveVersion() throws NotFoundException if no
 * ACTIVE version exists for the given promptId/agent combination.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module.js';
import { PromptVersionService } from './service/prompt-version.service.js';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const promptVersionService = app.get(PromptVersionService);

    // Check if already seeded
    const existing = await promptVersionService
      .listVersions('curriculum-extraction')
      .catch(() => []);

    if (existing.length > 0) {
      console.log(
        'Prompt versions for "curriculum-extraction" already exist:',
        existing.length,
      );
      return;
    }

    console.log('Seeding prompt_versions for curriculum-agent...');

    const promptVersion = await promptVersionService.create({
      promptId: 'curriculum-extraction',
      agent: 'curriculum-agent',
      systemPrompt: `You are a curriculum designer. Given a learner's goal and a list of concepts that already exist in the system, propose the concepts needed to teach this goal and the prerequisite relationships between them. Reuse existing concept names exactly where they already cover what's needed — only propose new concepts for genuine gaps. Keep prerequisite chains realistic and avoid redundant edges.`,
      outputSchema: {
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
      configuration: {},
      model: 'claude-sonnet-4-6',
    });

    if (!promptVersion) {
      throw new Error('Failed to create prompt version');
    }

    console.log('Created prompt version:', promptVersion._id);

    await promptVersionService.activate(promptVersion._id.toString());

    console.log(
      'Activated prompt version. Seeding complete!',
    );
  } finally {
    await app.close();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
