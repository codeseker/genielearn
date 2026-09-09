# GenieLearn — Project Cheat Sheet

Simple reference so you don't lose the thread. Read top to bottom whenever you feel lost.

---

## The one-line mental model

> User says what they want to learn (**goal**) → system builds a **curriculum folder** (**course**) for it →
> that folder slowly fills up with **modules → lessons → real content**, generated on demand →
> learner does stuff (**evidence**) → an **agent** watches and decides what happens next → loop.

Nothing is pre-generated. The course starts empty and fills in as the learner progresses.

---

## Plain-English glossary

| Term | What it actually is |
|---|---|
| **Concept** | A learnable "thing" — Node.js, HTTP, Async Programming. A reusable node in a shared graph. |
| **Prerequisite** | An edge saying "to learn X, you need Y first." Points from concept → its requirement. |
| **Goal** | The user's stated intent — "I want to learn Node.js." One row, belongs to one user. |
| **Course** | An empty folder created 1:1 with a goal. Just a title/status/slug — no real content lives here directly. |
| **Module** | A chapter inside the course. Generated later, not upfront. |
| **Lesson** | A topic inside a module. Also generated later. |
| **Content Version** | The actual generated text/exercises/quiz for a lesson. Versioned, so nothing is overwritten. |
| **Learner State** | A snapshot: "here's what this learner currently knows/is doing" — one per (user, goal). |
| **Learning Evidence** | A log of things the learner did (quiz result, skipped a lesson, time spent). Never overwritten, just appended. |
| **Agent Run / Decision** | The AI "brain" waking up, looking at learner state + evidence, and deciding what happens next (advance? remediate? generate more content?). |
| **Generation Job** | The async task that actually calls the LLM to produce a module/lesson/content, tracked so it's never done twice by accident. |

---

## Why concepts/prerequisites came first

They have **zero dependencies** — everything else (modules, lessons, learner state, agent decisions) points back to a `conceptId`. Build the map before you build anything that needs the map.

---

## Build order (checklist)

- [x] **auth** — done
- [x] **concepts + prerequisites** — CRUD + repo done, seeder written and tested, cycle detection confirmed working
- [ ] **learning (goals) + courses** ← you are here
  - `POST /goals` creates a `learning_goals` row
  - Same call also spins up its 1:1 `courses` row (empty shell, no content yet)
  - No modules/lessons/content generation wired in yet — that comes later
- [ ] **learner + assessments** — prerequisite assessment flow + the first `learner_state` snapshot
- [ ] **prompts + llm module** — thin wrappers so every LLM call is versioned and cost-tracked from day one
- [ ] **agents** — the orchestrator (`agent_runs` + `agent_decisions`), start rule-based before real LLM reasoning
- [ ] **generation + course-modules + lessons** — agent decisions become actual generation jobs → real modules/lessons
- [ ] **content** — the content_versions + content_evaluations quality loop (DRAFT → EVALUATING → PUBLISHED)
- [ ] **evidence, then gamification** — closes the loop back to learner state; gamification is a side-effect layer, built last

---

## Rule of thumb when you feel lost

Ask: **"What collection does this piece read from, and what does it write to?"**
If you can answer that one question, you know exactly where the piece sits in the loop above.