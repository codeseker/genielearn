// src/seed.ts
import { NestFactory } from '@nestjs/core';
import { ConflictException } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { ConceptService } from '../services/concepts.service.js';
import { PrerequisiteService } from '../services/prerequsite.service.js';
import { AppModule } from '../../../app.module.js';

interface SeedConcept {
  name: string;
  domain: string;
  difficulty: number;
  description: string;
}

// The concept list. Order doesn't matter for creation —
// prerequisite edges are wired up separately below by name.
const CONCEPTS: SeedConcept[] = [
  { name: 'Programming Basics', domain: 'general', difficulty: 1, description: 'Variables, loops, conditionals, functions.' },
  { name: 'JavaScript Fundamentals', domain: 'javascript', difficulty: 2, description: 'Core JS syntax, closures, scope, prototypes.' },
  { name: 'Asynchronous Programming', domain: 'javascript', difficulty: 2, description: 'Callbacks, promises, async/await, event loop.' },
  { name: 'HTTP', domain: 'web', difficulty: 1, description: 'Requests, responses, status codes, headers.' },
  { name: 'REST APIs', domain: 'web', difficulty: 2, description: 'Resource-oriented API design over HTTP.' },
  { name: 'Node.js', domain: 'backend', difficulty: 3, description: 'Server-side JavaScript runtime.' },
  { name: 'Express.js', domain: 'backend', difficulty: 3, description: 'Minimal Node.js web framework.' },
  { name: 'Databases Basics', domain: 'databases', difficulty: 2, description: 'Tables/collections, queries, CRUD concepts.' },
  { name: 'MongoDB', domain: 'databases', difficulty: 3, description: 'Document-oriented NoSQL database.' },
  { name: 'Mongoose', domain: 'databases', difficulty: 3, description: 'ODM for MongoDB in Node.js.' },
  { name: 'Authentication & Authorization', domain: 'backend', difficulty: 3, description: 'Identity, sessions, JWTs, access control.' },
  { name: 'WebSockets', domain: 'backend', difficulty: 3, description: 'Full-duplex real-time communication over TCP.' },
];

// Edges as [concept, prerequisite] pairs — plain English name pairs,
// resolved to ObjectIds after concepts are created.
const EDGES: [string, string][] = [
  ['JavaScript Fundamentals', 'Programming Basics'],
  ['Asynchronous Programming', 'JavaScript Fundamentals'],
  ['REST APIs', 'HTTP'],
  ['Node.js', 'JavaScript Fundamentals'],
  ['Node.js', 'Asynchronous Programming'],
  ['Node.js', 'HTTP'],
  ['Express.js', 'Node.js'],
  ['Express.js', 'REST APIs'],
  ['MongoDB', 'Databases Basics'],
  ['Mongoose', 'MongoDB'],
  ['Mongoose', 'Node.js'],
  ['Authentication & Authorization', 'Express.js'],
  ['WebSockets', 'Node.js'],
  ['WebSockets', 'HTTP'],
];

async function upsertConcept(
  conceptService: ConceptService,
  data: SeedConcept,
): Promise<{ id: string; name: string }> {
  try {
    const created = await conceptService.create(data as any);
    console.log(`✓ created concept: ${data.name}`);
    return { id: created.id.toString(), name: data.name };
  } catch (err) {
    if (err instanceof ConflictException) {
      // Already exists from a previous seed run — fetch it instead.
      const existing = await conceptService.findBySlugOrNull(slugify(data.name));
      if (existing) {
        console.log(`↺ concept already exists, reusing: ${data.name}`);
        return { id: existing._id.toString(), name: data.name };
      }
    }
    throw err;
  }
}

async function upsertEdge(
  prereqService: PrerequisiteService,
  idByName: Map<string, string>,
  conceptName: string,
  prereqName: string,
) {
  const conceptId = idByName.get(conceptName);
  const prerequisiteConceptId = idByName.get(prereqName);

  if (!conceptId || !prerequisiteConceptId) {
    throw new Error(`Missing id for edge: ${conceptName} -> ${prereqName}`);
  }

  try {
    await prereqService.create({ conceptId, prerequisiteConceptId, metadata: {} });
    console.log(`✓ edge: ${conceptName} requires ${prereqName}`);
  } catch (err) {
    if (err instanceof ConflictException) {
      console.log(`↺ edge already exists: ${conceptName} requires ${prereqName}`);
      return;
    }
    throw err; // real errors (e.g. cycle detected) should stop the seed
  }
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const connection = app.get<Connection>(getConnectionToken());
    await connection.asPromise();
    console.log(`MongoDB connected: ${connection.name}`);

    const conceptService = app.get(ConceptService);
    const prereqService = app.get(PrerequisiteService);

    console.log('--- seeding concepts ---');
    const idByName = new Map<string, string>();
    for (const c of CONCEPTS) {
      const { id, name } = await upsertConcept(conceptService, c);
      idByName.set(name, id);
    }

    console.log('\n--- seeding prerequisite edges ---');
    for (const [conceptName, prereqName] of EDGES) {
      await upsertEdge(prereqService, idByName, conceptName, prereqName);
    }

    console.log('\n--- sanity check: transitive prerequisites for Node.js ---');
    const nodeId = idByName.get('Node.js')!;
    const transitive = await prereqService.getTransitivePrerequisites(nodeId);
    const nameById = new Map(
      [...idByName.entries()].map(([name, id]) => [id, name]),
    );
    console.log(transitive.map((id) => nameById.get(id) ?? id));

    console.log('\nDone.');
    process.exit(1);
  } finally {
    await app.close();
  }
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});