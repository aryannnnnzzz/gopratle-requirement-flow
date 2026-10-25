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
