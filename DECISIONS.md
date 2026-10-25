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

