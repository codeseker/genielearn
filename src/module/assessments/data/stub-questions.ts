/**
 * Stub question bank — hardcoded MCQ questions keyed by concept slug.
 *
 * This is a temporary replacement for LLM-generated questions.
 * The lookup function is isolated here so it can be swapped out
 * for a real AI-generation call without touching the rest of the flow.
 */

interface StubQuestion {
  questionId: string;
  conceptId: string;
  question: string;
  type: 'MCQ';
  options: string[];
  correctAnswer: string;
  difficulty: number;
  explanation: string;
}

/**
 * Map from concept slug to a list of stub questions.
 * The slug must match what was seeded by `concept.seeder.ts`.
 * In production, conceptId would be used directly — here we use
 * slugs as stable keys since the seeder creates deterministic concepts.
 */
const QUESTION_BANK: Record<string, StubQuestion[]> = {
  'node-js': [
    {
      questionId: 'node-0',
      conceptId: '',
      question: 'What runtime does Node.js use to execute JavaScript?',
      type: 'MCQ',
      options: ['SpiderMonkey', 'V8', 'JavaScriptCore', 'Chakra'],
      correctAnswer: 'V8',
      difficulty: 2,
      explanation:
        'Node.js uses Google\'s V8 engine, which is also the JavaScript engine in Chrome.',
    },
    {
      questionId: 'node-1',
      conceptId: '',
      question:
        'Which module does Node.js provide for creating HTTP servers without external dependencies?',
      type: 'MCQ',
      options: ['net', 'http', 'express', 'fastify'],
      correctAnswer: 'http',
      difficulty: 2,
      explanation:
        'The built-in "http" module allows creating HTTP servers. "express" and "fastify" are third-party packages.',
    },
    {
      questionId: 'node-2',
      conceptId: '',
      question: 'What is the purpose of process.nextTick()?',
      type: 'MCQ',
      options: [
        'Run code after a delay',
        'Schedule a callback at the end of the current operation',
        'Kill the current process',
        'Restart the event loop',
      ],
      correctAnswer: 'Schedule a callback at the end of the current operation',
      difficulty: 3,
      explanation:
        'process.nextTick() schedules a callback to run after the current operation completes, before the event loop continues.',
    },
  ],
  'http': [
    {
      questionId: 'http-0',
      conceptId: '',
      question: 'Which HTTP method is idempotent by design?',
      type: 'MCQ',
      options: ['POST', 'PUT', 'PATCH', 'CONNECT'],
      correctAnswer: 'PUT',
      difficulty: 1,
      explanation:
        'PUT is idempotent — making the same PUT request multiple times produces the same result. POST is not idempotent.',
    },
    {
      questionId: 'http-1',
      conceptId: '',
      question: 'What does HTTP status code 304 indicate?',
      type: 'MCQ',
      options: [
        'Moved Permanently',
        'Not Modified',
        'Temporary Redirect',
        'Bad Gateway',
      ],
      correctAnswer: 'Not Modified',
      difficulty: 1,
      explanation:
        '304 Not Modified means the resource has not changed since the last request, allowing the client to use a cached version.',
    },
    {
      questionId: 'http-2',
      conceptId: '',
      question:
        'Which HTTP header is used to send credentials from the client to the server?',
      type: 'MCQ',
      options: ['Cookie', 'Authorization', 'X-Auth-Token', 'Access-Control-Allow-Origin'],
      correctAnswer: 'Authorization',
      difficulty: 2,
      explanation:
        'The Authorization header carries credentials (e.g., Bearer tokens). Cookie is also used for credentials but is not the primary auth header in REST APIs.',
    },
  ],
  'javascript-fundamentals': [
    {
      questionId: 'js-0',
      conceptId: '',
      question: 'What does the "this" keyword refer to in a regular function?',
      type: 'MCQ',
      options: [
        'The function itself',
        'The calling context (object or global)',
        'The enclosing function',
        'The module exports',
      ],
      correctAnswer: 'The calling context (object or global)',
      difficulty: 2,
      explanation:
        'In a regular function, "this" is determined by how the function is called (the execution context). In strict mode, it is undefined when called without an object.',
    },
    {
      questionId: 'js-1',
      conceptId: '',
      question: 'What is a closure in JavaScript?',
      type: 'MCQ',
      options: [
        'A way to close the browser',
        'A function that remembers its lexical scope',
        'A method to end a loop',
        'A built-in error handler',
      ],
      correctAnswer: 'A function that remembers its lexical scope',
      difficulty: 2,
      explanation:
        'A closure is a function that retains access to variables from its enclosing lexical scope, even after the outer function has returned.',
    },
  ],
  'asynchronous-programming': [
    {
      questionId: 'async-0',
      conceptId: '',
      question: 'What does "await" do in an async function?',
      type: 'MCQ',
      options: [
        'Pauses the entire thread',
        'Suspends execution until a Promise settles',
        'Blocks the event loop',
        'Returns a callback',
      ],
      correctAnswer: 'Suspends execution until a Promise settles',
      difficulty: 2,
      explanation:
        '"await" pauses the async function (not the thread) until the Promise resolves or rejects, allowing other work to proceed on the event loop.',
    },
    {
      questionId: 'async-1',
      conceptId: '',
      question: 'What is the output order of Promise.resolve().then() vs setTimeout()?',
      type: 'MCQ',
      options: [
        'setTimeout runs first',
        'They run in the order they are called',
        'Promise.then runs first',
        'They run simultaneously',
      ],
      correctAnswer: 'Promise.then runs first',
      difficulty: 3,
      explanation:
        'Microtasks (Promise callbacks) execute before macrotasks (setTimeout). So .then() runs before the setTimeout callback.',
    },
  ],
  'programming-basics': [
    {
      questionId: 'pb-0',
      conceptId: '',
      question: 'What is the difference between "let" and "const"?',
      type: 'MCQ',
      options: [
        'No difference',
        'let allows reassignment, const does not',
        'const is block-scoped, let is not',
        'let is deprecated',
      ],
      correctAnswer: 'let allows reassignment, const does not',
      difficulty: 1,
      explanation:
        'Both let and const are block-scoped. The key difference is that const prevents reassignment of the variable binding.',
    },
    {
      questionId: 'pb-1',
      conceptId: '',
      question: 'What does "===" check in JavaScript?',
      type: 'MCQ',
      options: [
        'Value only',
        'Value and type (strict equality)',
        'Reference equality',
        'Type only',
      ],
      correctAnswer: 'Value and type (strict equality)',
      difficulty: 1,
      explanation:
        'The === operator checks both value and type without type coercion. "1" === 1 is false because they are different types.',
    },
  ],
  'rest-apis': [
    {
      questionId: 'rest-0',
      conceptId: '',
      question: 'Which HTTP method should be used to create a new resource?',
      type: 'MCQ',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      correctAnswer: 'POST',
      difficulty: 2,
      explanation:
        'POST is used to create new resources. PUT replaces an existing resource, while GET retrieves and DELETE removes.',
    },
    {
      questionId: 'rest-1',
      conceptId: '',
      question: 'What is a slug in REST API design?',
      type: 'MCQ',
      options: [
        'A type of authentication token',
        'A URL-friendly identifier derived from a name',
        'A database index',
        'A request header',
      ],
      correctAnswer: 'A URL-friendly identifier derived from a name',
      difficulty: 2,
      explanation:
        'A slug is a URL-safe string derived from a name, e.g., "my-blog-post" from "My Blog Post". It makes URLs human-readable.',
    },
  ],
  'databases-basics': [
    {
      questionId: 'db-0',
      conceptId: '',
      question: 'What does CRUD stand for?',
      type: 'MCQ',
      options: [
        'Create, Read, Update, Delete',
        'Connect, Run, Use, Drop',
        'Cache, Retrieve, Upload, Download',
        'Compile, Run, Unload, Debug',
      ],
      correctAnswer: 'Create, Read, Update, Delete',
      difficulty: 1,
      explanation:
        'CRUD represents the four basic operations for persistent storage: Create, Read, Update, Delete.',
    },
  ],
  'mongodb': [
    {
      questionId: 'mongo-0',
      conceptId: '',
      question: 'What is MongoDB\'s primary data storage format?',
      type: 'MCQ',
      options: ['Tables', 'Documents (BSON)', 'Key-Value pairs', 'Graphs'],
      correctAnswer: 'Documents (BSON)',
      difficulty: 2,
      explanation:
        'MongoDB stores data as BSON (Binary JSON) documents in collections, unlike relational databases that use tables and rows.',
    },
  ],
  'mongoose': [
    {
      questionId: 'mongoose-0',
      conceptId: '',
      question: 'What is the purpose of a Mongoose schema?',
      type: 'MCQ',
      options: [
        'Directly creates database tables',
        'Defines the shape of documents and their validation',
        'Replaces MongoDB entirely',
        'Only handles HTTP requests',
      ],
      correctAnswer: 'Defines the shape of documents and their validation',
      difficulty: 2,
      explanation:
        'A Mongoose schema defines the structure, types, default values, and validation rules for documents in a collection.',
    },
  ],
  'express-js': [
    {
      questionId: 'express-0',
      conceptId: '',
      question: 'What is middleware in Express.js?',
      type: 'MCQ',
      options: [
        'A database connector',
        'A function that has access to req, res, and next',
        'A type of template engine',
        'A built-in authentication module',
      ],
      correctAnswer: 'A function that has access to req, res, and next',
      difficulty: 2,
      explanation:
        'Middleware functions execute during the request-response cycle, can modify req/res, and call next() to pass control.',
    },
  ],
  'authentication-authorization': [
    {
      questionId: 'auth-0',
      conceptId: '',
      question: 'What does JWT stand for?',
      type: 'MCQ',
      options: [
        'JSON Web Token',
        'Java Web Toolkit',
        'Joint Web Transfer',
        'JavaScript Wrapped Token',
      ],
      correctAnswer: 'JSON Web Token',
      difficulty: 2,
      explanation:
        'JWT stands for JSON Web Token — a compact, URL-safe token format used for securely transmitting information between parties.',
    },
  ],
  'websockets': [
    {
      questionId: 'ws-0',
      conceptId: '',
      question: 'How does WebSocket communication differ from HTTP?',
      type: 'MCQ',
      options: [
        'WebSocket is faster',
        'WebSocket provides full-duplex, persistent connection',
        'WebSocket uses UDP',
        'WebSocket cannot send binary data',
      ],
      correctAnswer: 'WebSocket provides full-duplex, persistent connection',
      difficulty: 3,
      explanation:
        'Unlike HTTP\'s request-response model, WebSocket maintains a persistent connection allowing both client and server to send messages at any time.',
    },
  ],
};

/**
 * Returns stub questions for a given concept slug.
 * If no questions exist for the slug, returns an empty array.
 *
 * In a future iteration, this function can be replaced by an LLM call
 * that generates questions dynamically — the rest of the assessment
 * flow does not need to change.
 */
export function getStubQuestionsForConcept(
  conceptSlug: string,
): StubQuestion[] {
  return QUESTION_BANK[conceptSlug] ?? [];
}
