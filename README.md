# GenieLearn

## Description

GenieLearn is a full-stack web application that transforms natural language prompts into structured, multi-module learning courses. Users describe what they want to learn, and the system leverages large language models to produce a complete course outline with modules, lessons, estimated durations, and supplementary YouTube videos.

The application is built for self-learners, educators, and content creators who need to rapidly scaffold educational content without manually designing curricula. It handles everything from prompt validation and security screening to progress tracking and course completion.

## Demo Video

## Key Features

- AI-powered course and lesson generation from natural language prompts
- Modular course structure with progress tracking
- Secure authentication with JWT and Google OAuth
- On-demand lesson generation with rich markdown content and code blocks
- Supplementary YouTube videos for every lesson
- PDF export for offline learning
- Clean, accessible UI built with modern component primitives

---

## Project Flow Diagram

```
User (Browser)
    |
    v
React Client (Vite + TypeScript)
    |--- Auth Pages (Login / Register / Google OAuth)
    |--- Home Page (Create Course Prompt + Course List)
    |--- Course Page (Module Sidebar + Lesson Viewer)
    |--- Profile Page (User Settings + Avatar Upload)
    |
    | Axios (HTTP + JWT interceptor)
    v
Express REST API  (/api/v1)
    |
    |--- Auth Middleware (JWT verification)
    |
    |--- Routes
    |       |--- /auth      -> Register, Login, Logout, Refresh Token, Google OAuth
    |       |--- /course    -> Create (AI), List, Show, Delete, Stats
    |       |--- /module    -> Module operations
    |       |--- /lesson    -> Generate (AI), Read, Mark Complete
    |       |--- /user      -> Profile, Avatar upload
    |       |--- /youtube   -> Video search proxy
    |
    |--- AI Config (Provider Adapter Pattern)
    |       |--- Gemini Adapter  (gemini-2.0-flash-lite)
    |       |--- Groq Adapter    (gpt-oss-120b)
    |       |--- OpenAI Adapter  (gemma-3-27b-it via AIML API)
    |
    |--- Prompt Registry
    |       |--- Course Generation Prompt
    |       |--- Lesson Generation Prompt
    |       |--- Security Validation Prompt
    |
    |--- Validation Layer (Zod schemas + AI security screening)
    |
    v
MongoDB (Mongoose ODM)
    |--- User          (credentials, OAuth, avatar ref, refresh token)
    |--- Course        (title, slug, tags, level, prerequisites, soft-delete)
    |--- Module        (title, order, course ref, completion status)
    |--- Lesson        (title, order, AI content, YouTube IDs, completion status)
    |--- Role          (role definitions)
    |--- Permission    (permission definitions)
    |--- RolePermission(role-permission mapping)
    |--- Upload        (file metadata, avatar storage)
    |
    v
External APIs
    |--- YouTube Data API v3  (supplementary video search)
    |--- Google OAuth2        (social login)
```

### Course Generation Flow

```
1. User submits a natural language prompt
                |
                v
2. Server validates input (Zod schema: 10-500 chars)
                |
                v
3. AI Security Check (prompt screened for abuse via LLM)
                |
                v
4. Course Prompt assembled from provider-specific registry
                |
                v
5. AI generates structured JSON (title, modules, lessons, metadata)
                |
                v
6. Server parses response, generates unique slugs
                |
                v
7. Course, Modules, and Lessons saved to MongoDB (transaction)
                |
                v
8. Client redirects to course view
```

### Lesson Content Generation Flow

```
1. User navigates to an ungenerated lesson
                |
                v
2. Server loads course context and adjacent lesson info
                |
                v
3. AI generates detailed lesson content (markdown with code blocks)
                |
                v
4. YouTube Data API fetches relevant supplementary videos
                |
                v
5. Lesson content and video IDs saved to database
                |
                v
6. Client renders markdown content with syntax highlighting + embedded videos
```

## Tech Stack

**Languages**

- TypeScript
- HTML
- CSS

**Frontend**

- React 19
- Vite 7
- TailwindCSS 4
- Redux Toolkit (state management)
- Redux Persist (persistent state)
- React Query / TanStack Query (server state)
- React Router DOM (client-side routing)
- React Hook Form + Zod (form validation)
- Radix UI (accessible component primitives)
- Lucide React (icon library)
- React Markdown + rehype + remark (lesson content rendering)
- React Syntax Highlighter (code block highlighting)
- html2canvas + jsPDF (PDF export)
- Axios (HTTP client with interceptors)

**Backend**

- Node.js
- Express 5
- Mongoose 9 (MongoDB ODM)
- JSON Web Tokens (access + refresh token rotation)
- bcrypt (password hashing)
- Zod (request validation)
- cookie-parser (refresh token cookies)
- express-fileupload (avatar uploads)
- CORS (cross-origin configuration)
- dotenv (environment configuration)

**AI Providers**

- Google Generative AI SDK (Gemini)
- Groq SDK
- OpenAI SDK (via AIML API)

**Database**

- MongoDB

**External APIs**

- YouTube Data API v3
- Google OAuth2

**Authentication**

- JWT (access + refresh tokens with HTTP-only cookies)
- Google OAuth 2.0 (social login)
