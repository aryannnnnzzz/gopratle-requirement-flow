# Architectural Decisions, Assumptions & Trade-offs (DECISIONS.md)

This log tracks architectural and design decisions, assumptions, and trade-offs made throughout the implementation of the 4-step requirement posting flow (Next.js + Node/Express/MongoDB). It also serves as the reference script for explaining design choices in the project demo/recording.

---

## Phase 1: Setup & Project Initialization

### 1. Monorepo Structure & Separate Package Management
- **Decision:** Use standard separate `frontend/` and `backend/` directories with independent `package.json` configurations.
- **Rationale:** The frontend deploys to Vercel and the backend deploys to Render. Independent package manifests simplify zero-configuration deployment on both platforms without needing custom monorepo orchestration tools (e.g. Turborepo/Nx/Lerna) that might introduce build complexity for a focused take-home assignment.
- **Trade-off:** Dependencies are managed per sub-project (e.g. Zod installed in both `frontend` and `backend`).

### 2. TypeScript Strict Mode
- **Decision:** Strict mode enabled on both frontend (`tsconfig.json`) and backend (`tsconfig.json`), disallowing implicit `any`, forcing strict null checks and consistent casing.
- **Rationale:** Ensures compile-time safety and prevents runtime edge cases, especially across form state shapes and API DTOs.

### 3. Backend Architecture & Config
- **Decision:** Express configured with `helmet` for HTTP header security, `cors` configured strictly against `CLIENT_ORIGIN` (with fallback for development), `express.json()` for parsing, and a dedicated database connection module `src/config/db.ts`.
- **Assumption:** In development, if `MONGODB_URI` is not set or unreachable, the server logs a clear, descriptive error and allows the `/health` endpoint to indicate status without hard crashing ungracefully.
- **Trade-off:** `connectDB()` logs explicit diagnostic instructions for missing or malformed Atlas URIs.

### 4. Frontend Framework Setup
- **Decision:** Next.js (App Router) with TypeScript and Tailwind CSS as specified in the plan.
- **Environment:** Configured `NEXT_PUBLIC_API_URL` in `.env.example` targeting `http://localhost:5000/api`.

---

## Phase 2: Backend Architecture & Data Layer

### 1. Mongoose Discriminator Pattern
- **Decision:** Implemented a single `requirements` collection with Mongoose discriminators (`PlannerRequirement`, `PerformerRequirement`, `CrewRequirement`) keyed by `category`.
- **Rationale:** Discriminators allow each category to maintain its own strict schema for `details` while sharing base metadata (`eventName`, `eventType`, `startDate`, `endDate`, `location`, `venue`). This provides polymorphic storage with single-query cross-category filtering, pagination, and sorting on `createdAt`.
- **Trade-off:** In Mongoose, creating through discriminator sub-models requires resolving the target model via `getModelForCategory(category)`.

### 2. Fast-Fail DB Resilience (`bufferCommands: false` + 503 Guard)
- **Decision:** Set `mongoose.set("bufferCommands", false)` and added a `requireDbConnection` middleware on all `/api` routes.
- **Rationale:** By default, Mongoose buffers operations when disconnected, causing API requests to hang indefinitely until socket timeout. Disabling command buffering and explicitly returning HTTP 503 with standard JSON error shapes ensures fast, predictable failure modes.
- **Assumption:** Health checks `/health` remain accessible (200 OK) with `{ status: "ok", db: "connected" | "disconnected" }` so uptime monitors can distinguish between app server liveness and database dependency health.

### 3. Zod Discriminated Union & Strict Unknown Field Rejection
- **Decision:** Modelled the API input as `z.discriminatedUnion("category", [plannerRaw, performerRaw, crewRaw])` with `.strict()` on all object levels, followed by `.superRefine()`.
- **Rationale:** `z.discriminatedUnion` checks the discriminator key (`category`) first and routes to the exact schema, immediately catching mismatched payloads (e.g. `category: "performer"` with planner details). The `.strict()` mode ensures client payloads cannot inject unexpected or arbitrary fields.
- **Trade-off:** `z.discriminatedUnion` requires direct `ZodObject` children in TypeScript; cross-field validations (such as `dateType === 'range'` requiring `endDate >= startDate` and `planningDeadline < startDate`) are attached via a unified `.superRefine()`.

### 4. Reusable Sample Payloads for Windows/Multi-platform
- **Decision:** Saved standardized payloads in `backend/samples/*.json` (`planner.json`, `performer.json`, `crew.json`, `invalid-mismatched.json`, `invalid-dates.json`).
- **Rationale:** Allows immediate testing via PowerShell `Invoke-RestMethod` and standard `curl.exe -d @file.json` without shell escaping issues on Windows.

---

## Phase 3: Backend Automated Test Suite (Jest + Supertest + Memory Server)

### 1. Zero-Touch Database Isolation
- **Decision:** Tests run strictly using `mongodb-memory-server` and explicitly clear `process.env.MONGODB_URI` inside test setup.
- **Rationale:** Ensures automated test runs can never contaminate or accidentally drop documents from the live Atlas development/production cluster, guaranteeing deterministic, isolated test runs across all environments and CI.

### 2. Decoupled Express App Architecture (`app.ts` vs `index.ts`)
- **Decision:** Separated Express configuration into `backend/src/app.ts` (exporting the Express application without calling `listen`) and `backend/src/index.ts` (handling environment configuration, database connection, and port binding).
- **Rationale:** Enables Supertest to instantiate the application ephemeral in-process without occupying network ports or interfering with dev servers.

### 3. Granular Error Status Codes for ID Resolution
- **Decision:** Updated `GET /api/requirements/:id` to distinguish between malformed identifier formats (HTTP 400 Bad Request with `{ success: false, message: "Invalid requirement ID", errors: [...] }`) and well-formed 24-character hex ObjectIds that simply do not exist in the collection (HTTP 404 Not Found).
- **Rationale:** Aligns with RESTful best practices: client syntax/format errors are 4xx client errors (400), whereas valid queries returning empty results are resource missing errors (404).

---

## Phase 4: Frontend Wizard Architecture (Checkpoint A)

### 1. Per-Step Modular Schema Validation
- **Decision:** Split form validation into granular per-step Zod schemas in `frontend/lib/schemas.ts` (`eventBasicsSchema`, `plannerStep2Schema`, `plannerStep3Schema`, `performerStep2Schema`, `performerStep3Schema`, `crewStep2Schema`, `crewStep3Schema`).
- **Rationale:** Enforces strict boundary validation at each step transition before proceeding to the next step, preventing invalid or incomplete partial state from propagating through the wizard.

### 2. Config-Driven Dynamic Form Polymorphism
- **Decision:** Implemented `stepConfig.ts` indexing `[Step2Component, Step3Component]` dynamically by `category` (`planner`, `performer`, `crew`).
- **Rationale:** Decouples the wizard container from hardcoded conditional chains, making adding or updating category flows declarative and maintainable.

### 3. State Persistence & Safe Category Invalidation
- **Decision:** Used Zustand with `sessionStorage` persistence. If a user navigates back to Step 1 and selects a different category when category details already exist, a confirmation dialog triggers to warn that previous category details will be cleared.
- **Rationale:** Prevents carrying over irrelevant polymorphic fields (e.g. performer DJ rider settings persisting when switching to a sound crew requirement) into the final submission payload.

### 4. Hydration Safety & Input Synchronization Root-Cause Fixes
- **Decision:** Configured `skipHydration: true` in Zustand persist options combined with a `useWizardHydrated()` hook guarding `/post-requirement`. Synchronized form inputs with strict defined values (`""` and explicit numeric fallbacks) using `values` binding in `react-hook-form`.
- **Rationale:** Resolves Next.js / React 19 hydration mismatch warnings (where server pre-render had empty state while client rehydrated immediately with cached `sessionStorage` values) and eliminates uncontrolled-to-controlled input warnings.

### 5. Strict Category Selection Gate (Step 1)
- **Decision:** Initialized `category` strictly to empty string (`""`) in `wizardStore.ts` and `EventBasics.tsx`, removing the fallback to `"planner"`. Disabled the Continue button (`isNextDisabled={!selectedCategory}`) until a category is explicitly chosen.
- **Rationale:** Prevents unintended pre-selection of the "Event Planner" flow and enforces user intent before unlocking downstream category-specific steps.



