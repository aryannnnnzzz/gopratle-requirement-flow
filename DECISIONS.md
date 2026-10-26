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

---

## Phase 4 Checkpoint B: Review, Submission, Resilience & List Feed

### 1. Strict Payload Sanitization & Stripping (`buildRequirementPayload`)
- **Decision:** Implemented a dedicated payload builder in `frontend/lib/payload.ts` that enforces the backend schema contract before sending:
  - If `dateType === "single"`, `endDate` is stripped completely.
  - Empty optional strings (`venue`, `theme`, `notes`, `technicalRequirements`) are omitted.
  - Only category-specific fields are mapped into `details` based on `category`.
- **Rationale:** The backend uses Zod `.strict()` schemas on `details` and payloads. Sending nullish or foreign category fields would fail validation.

### 2. Formatted Multi-Section Review with Direct Step Jump
- **Decision:** Step 4 groups data into three human-readable sections: Event Basics, Scope & Specifications, and Logistics, Schedule & Budget. Currency is formatted in INR (`Intl.NumberFormat`), dates are formatted to readable day-month-year strings, and booleans are rendered as descriptive pills. Each section features an "Edit" button that invokes `goToStep(n)`.
- **Rationale:** Eliminates raw JSON dumping and provides an intuitive, high-confidence review interface for non-technical event organizers.

### 3. Server Error Mapping & 503 Resilience
- **Decision:** Implemented typed error handling via `ApiError` in `frontend/lib/api.ts`.
  - HTTP 400 validation errors map `errors[].path` to actionable "(Jump to Step X)" buttons, guiding the user back to the exact step requiring correction.
  - HTTP 503 (database unavailable) and network errors present an amber banner with an inline "Retry" action that resubmits without data loss.
  - The submit button disables and displays an animated spinner while the request is in-flight to prevent duplicate submissions.

### 4. Safe State Teardown on Success
- **Decision:** When submission succeeds, `SuccessScreen` displays the MongoDB reference ID (with clipboard copy), category badge, and metadata summary. The "Post Another Requirement" CTA explicitly invokes `resetWizard()`, which resets the Zustand state and clears `sessionStorage`.
- **Rationale:** Ensures future submissions start from a completely pristine state without remnants of previous event data.

### 5. Paginated Category Feed (`/requirements`)
- **Decision:** Built a responsive requirement feed at `/requirements` featuring category tabs (`All`, `Event Planners`, `Performers`, `Crew & Tech`), calling `GET /api/requirements?category=&page=&limit=`.
- **Rationale:** Provides immediate visual proof that requirements are "clearly categorised" in MongoDB discriminators, complete with loading skeletons, empty states, and pagination controls.

---

## Phase 5: Polish & Accessibility

### 1. Dev-Only Error Testing Button Gating
- **Decision:** Gated the "Test Server Error" button in `ReviewStep.tsx` strictly behind `process.env.NODE_ENV === "development"` with `handleForceServerError` defined conditionally.
- **Rationale:** Ensures debugging and demo testing triggers never ship to production environments or confuse end users in live deployments.

### 2. Category Selection ARIA & Keyboard Navigation
- **Decision:** Upgraded category selection cards in `EventBasics.tsx` to use `role="radiogroup"` with `aria-labelledby="category-group-label"`. Each card features `role="radio"`, `aria-checked`, explicit Space/Enter `onKeyDown` handlers, and `focus-visible:ring-2 focus-visible:ring-indigo-500` styles.
- **Rationale:** Provides screen-reader and full keyboard navigation compliance according to WAI-ARIA authoring practices.

### 3. Modal Focus Trap & Accessible Teardown
- **Decision:** Rewrote `CategoryChangeModal.tsx` using `useRef` hooks to automatically focus the "Cancel" action upon modal mount, trap Tab/Shift+Tab focus between Cancel and Confirm buttons, listen for the `Escape` key, and support backdrop click cancellation.
- **Rationale:** Prevents keyboard focus from escaping into underlying inert background elements while the modal is open.

### 4. Per-Route Layout Metadata & Favicon
- **Decision:** Created route-level `layout.tsx` files for `/post-requirement` and `/requirements` with explicit descriptive `title` and `description` metadata, and added `app/icon.svg` as a brand favicon.
- **Rationale:** Ensures clean browser tab titles, social preview cards, and eliminates browser 404 favicon requests without requiring client-side `next/head` hacks.

---

## Phase 6: Frontend Automated Test Suite (Vitest + React Testing Library)

### 1. Vitest over Jest for Next.js 16 + React 19
- **Decision:** Adopted Vitest v5 with `@vitejs/plugin-react`, `jsdom`, and `@testing-library/react` configured via `vitest.config.mts`.
- **Rationale:** Vitest natively supports modern ESM, Next.js path aliases (`@/*`), and TSX transformations without needing the heavy Babel or ts-jest transformation pipeline required by Jest in Next.js 16.

### 2. Upgraded Resolver Compatibility (`@hookform/resolvers@6`)
- **Decision:** Upgraded `@hookform/resolvers` to version 6 to fully support Zod 4 error structures (`error.issues` instead of Zod 3's `error.errors`). Cast resolvers in `useForm` options to preserve strict TypeScript type-checking on form payloads across numeric coercions.
- **Rationale:** Resolves unhandled runtime rejections where earlier resolver versions threw unexpected errors on Zod 4 issue schemas.

### 3. Multi-Scenario Wizard Test Suite
- **Decision:** Implemented 13 automated tests covering payload generation (single vs range dates, optional stripping, certifications array mapping), Step 1 input validation & category button gating, Step 2 field rendering across all 3 categories, category switch confirmation and details reset, and Review step submissions (success, 400 validation error mapping, network failure retry).
- **Rationale:** Guarantees critical form boundaries, state transitions, and API error mappings remain regression-free.

---

## Phase 8: Documentation & Knowledge Sharing

### 1. Unified Comprehensive README
- **Decision:** Authored `README.md` containing end-to-end architecture diagrams, local setup commands, API request/response samples for all three categories, schema justification (why Mongoose discriminators), assumptions, known limitations, and future improvements.
- **Rationale:** Provides evaluators and developers with an immediate, self-contained reference for running, testing, and reviewing the codebase.





