# GoPratle Assignment: Requirement Posting Flow

You are building a working, deployable multi-step "post a requirement" flow. Follow this plan phase by phase. **Finish and verify each phase before starting the next.** Keep a running `DECISIONS.md` (decisions, assumptions, trade-offs) as you go.

## 1. Goal

A 4-step form where a user posts an event requirement under one of three categories: **Event Planner**, **Performer**, or **Crew**. Steps 2 and 3 adapt to the category chosen in Step 1. On submit, the data is saved to MongoDB and clearly categorised.

- Step 1: Event Basics
- Step 2: Category-specific fields (part 1)
- Step 3: Category-specific fields (part 2)
- Step 4: Review and Submit

## 2. Stack (fixed, do not substitute)

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Forms | react-hook-form + zod (`@hookform/resolvers`) |
| Wizard state | zustand, persisted to `sessionStorage` |
| Backend | Node.js, Express, TypeScript |
| DB | MongoDB + Mongoose (Atlas in prod) |
| Validation | zod on the backend as well |
| Tests | Jest + Supertest (backend), React Testing Library (frontend) |
| Deploy | Vercel (frontend), Render (backend), MongoDB Atlas |

## 3. Repo structure

```
/
├── README.md
├── DECISIONS.md
├── frontend/
│   ├── app/
│   │   ├── page.tsx                  # landing, CTA to the flow
│   │   ├── post-requirement/page.tsx # wizard
│   │   └── requirements/page.tsx     # bonus: list view with category tabs
│   ├── components/
│   │   ├── wizard/                   # Stepper, StepShell, ReviewStep, SuccessScreen
│   │   └── steps/
│   │       ├── EventBasics.tsx
│   │       ├── planner/ (PlannerStep2.tsx, PlannerStep3.tsx)
│   │       ├── performer/ (PerformerStep2.tsx, PerformerStep3.tsx)
│   │       └── crew/ (CrewStep2.tsx, CrewStep3.tsx)
│   ├── lib/ (api.ts, schemas.ts, stepConfig.ts)
│   ├── store/wizardStore.ts
│   └── .env.example
└── backend/
    ├── src/
    │   ├── index.ts
    │   ├── config/db.ts
    │   ├── models/ (Requirement.ts with discriminators)
    │   ├── schemas/ (zod schemas)
    │   ├── controllers/requirement.controller.ts
    │   ├── routes/requirement.routes.ts
    │   ├── middleware/ (validate.ts, errorHandler.ts)
    │   └── tests/
    └── .env.example
```

## 4. Data model

One collection, `requirements`, using **Mongoose discriminators** on a `category` key.

**Base fields (all categories)**

| Field | Type | Notes |
|---|---|---|
| `eventName` | string | required, trimmed, 3-120 chars |
| `eventType` | string | required, enum (Wedding, Corporate, Concert, Birthday, Festival, Other) |
| `dateType` | `"single"` \| `"range"` | required |
| `startDate` | Date | required, not in the past |
| `endDate` | Date | required if `range`, must be >= `startDate` |
| `location` | string | required |
| `venue` | string | optional |
| `category` | `"planner"` \| `"performer"` \| `"crew"` | required, discriminator key |
| `details` | object | shape depends on category |
| `createdAt` / `updatedAt` | Date | timestamps |

**Planner `details`**
- `services`: string[] (decor, catering, AV, photography, logistics, other), min 1
- `guestCount`: number, >= 1
- `theme`: string, optional
- `budgetMin`, `budgetMax`: numbers, `max >= min`
- `planningDeadline`: Date, optional, must be before event start
- `notes`: string, optional

**Performer `details`**
- `performerType`: enum (DJ, Singer, Band, Dancer, Comedian, Magician, Other)
- `genre`: string
- `performanceDurationMins`: number, >= 15
- `numberOfPerformers`: number, >= 1
- `equipmentProvidedByHost`: boolean
- `technicalRequirements`: string, optional
- `budgetPerPerformance`: number, >= 0
- `travelAccommodationCovered`: boolean

**Crew `details`**
- `roles`: array of `{ role: enum (Sound, Lighting, Stage, Security, Photography, Videography, Catering Staff, Other), count: number >= 1 }`, min 1 item
- `shiftHours`: number, 1-24
- `experienceLevel`: enum (Entry, Intermediate, Expert)
- `dailyRate`: number, >= 0
- `callTime`: string (HH:mm)
- `requiredCertifications`: string[], optional

## 5. API contract

Base path: `/api`

### `POST /api/requirements`
Request body:
```json
{
  "eventName": "Sharma Wedding Sangeet",
  "eventType": "Wedding",
  "dateType": "range",
  "startDate": "2026-12-10",
  "endDate": "2026-12-12",
  "location": "Jaipur, Rajasthan",
  "venue": "Rambagh Palace",
  "category": "performer",
  "details": {
    "performerType": "DJ",
    "genre": "Bollywood",
    "performanceDurationMins": 120,
    "numberOfPerformers": 1,
    "equipmentProvidedByHost": false,
    "budgetPerPerformance": 40000,
    "travelAccommodationCovered": true
  }
}
```
Success `201`:
```json
{ "success": true, "data": { "_id": "...", "category": "performer", "createdAt": "..." } }
```
Error `400`:
```json
{ "success": false, "message": "Validation failed", "errors": [{ "path": "details.budgetPerPerformance", "message": "Required" }] }
```

### `GET /api/requirements?category=planner|performer|crew&page=1&limit=10`
Returns a paginated list, filtered by category if provided.

### `GET /api/requirements/:id`
Returns one requirement, or `404`.

### `GET /health`
Returns `{ "status": "ok" }`.

## 6. Phases

### Phase 1: Setup
- [ ] Create the monorepo structure above.
- [ ] Backend: Express + TS, dotenv, cors (origin from env), helmet, `express.json()`, `/health`.
- [ ] Mongoose connection with a clear failure message on a bad URI.
- [ ] Frontend: Next.js + Tailwind, `NEXT_PUBLIC_API_URL` env.
- [ ] `.env.example` in both folders. `.gitignore` covers `.env`, `node_modules`, `.next`, `dist`.

**Done when:** both apps run locally and `/health` returns ok.

### Phase 2: Backend
- [ ] Build the Mongoose base model and the three discriminators from section 4.
- [ ] Build the zod schemas using a discriminated union on `category`, with `details` validated per category.
- [ ] Add the `validate` middleware returning the error shape in section 5.
- [ ] Build the controllers and routes for the three endpoints.
- [ ] Add the central error handler (including Mongoose `ValidationError`, `CastError` on a bad `:id`, and a catch-all `500` that doesn't leak stack traces).
- [ ] Reject a `details` payload that doesn't match its `category`.
- [ ] Reject unknown fields (zod `.strict()`).

**Done when:** all three categories can be POSTed with curl/Postman and show up in MongoDB under the right category.

### Phase 3: Backend tests
- [ ] Use Jest + Supertest with `mongodb-memory-server` (or a test DB).
- [ ] Cover: valid POST for each category, missing required fields, wrong `details` for the category, `endDate` before `startDate`, a past date, invalid `:id`, list filtering by category, and the `404` case.

**Done when:** `npm test` passes.

### Phase 4: Frontend wizard
- [ ] Build the `/post-requirement` page with a Stepper (4 steps), a progress indicator, and Back/Next.
- [ ] Build the zustand store holding `{ currentStep, event, category, details }`, persisted to `sessionStorage`.
- [ ] **Step 1 (EventBasics):**
  - Fields: event name, event type (select), date mode toggle (single / range) with date inputs, location, optional venue.
  - Category selector as three selectable cards (Event Planner, Performer, Crew) with a short description each.
  - Per-step zod validation, inline errors, and Next disabled until valid.
- [ ] **Steps 2 and 3:** render from `lib/stepConfig.ts`:
  ```ts
  export const stepConfig = {
    planner:   [PlannerStep2, PlannerStep3],
    performer: [PerformerStep2, PerformerStep3],
    crew:      [CrewStep2, CrewStep3],
  };
  ```
  - Split the category fields from section 4 sensibly across the two steps (Step 2: what you need, Step 3: logistics, budget and schedule).
  - Each step validates with its own zod sub-schema.
  - If the user goes back and **changes the category**, clear the old `details` and show a short confirmation first.
  - Crew `roles` is a dynamic list (add/remove rows, using `useFieldArray`).
- [ ] **Step 4 (Review and Submit):**
  - Read-only summary grouped by section, each with an "Edit" link back to its step.
  - Submit calls `POST /api/requirements` through `lib/api.ts`.
  - Show a loading state and disable the button during submission (no double submits).
  - Show server validation errors mapped back to the fields or as a banner.
  - On success, show a SuccessScreen with the reference ID, the category badge and a "Post another" button that resets the store.
- [ ] Bonus: a `/requirements` page with category tabs listing submissions (this makes the "clearly categorised" requirement visible in the demo).

**Done when:** all three flows work end to end against the local backend.

### Phase 5: Polish
- [ ] Responsive layout (mobile first), clean visual design, consistent spacing.
- [ ] Accessibility: labels tied to inputs, `aria-invalid` and `aria-describedby` on errors, keyboard-navigable stepper, visible focus states.
- [ ] Loading, error and empty states everywhere.
- [ ] Warn on page refresh mid-flow only if the data is unsaved (state is already persisted in sessionStorage).

### Phase 6: Frontend tests
- [ ] Test that Step 1 blocks Next when invalid.
- [ ] Test that the correct Step 2 fields render for each category.
- [ ] Test that changing the category clears the old details.
- [ ] Test the Review step's submit success and failure paths with a mocked API.

### Phase 7: Deploy
- [ ] Create a MongoDB Atlas cluster, a DB user, and allow network access (0.0.0.0/0 is fine for the assignment, but note it as a limitation).
- [ ] Deploy the backend to Render: build `npm run build`, start `npm start`, env vars `MONGODB_URI`, `CLIENT_ORIGIN`, `PORT`.
- [ ] Deploy the frontend to Vercel: root dir `frontend`, env `NEXT_PUBLIC_API_URL`.
- [ ] Set backend CORS `CLIENT_ORIGIN` to the final Vercel URL.
- [ ] Smoke test all three categories on the live URLs and confirm the documents in Atlas.

### Phase 8: Docs
README must include:
- [ ] Overview and live URLs
- [ ] Architecture diagram or short description
- [ ] Setup steps (install, env vars, run, test)
- [ ] API reference with sample requests and responses
- [ ] Schema explanation and why discriminators were used
- [ ] Assumptions, limitations, and future improvements

## 7. Quality bar and rules

- TypeScript strict mode, no `any` unless justified.
- No secrets committed. Use env vars only.
- Keep components small. Keep step fields declarative, not copy-pasted.
- Share types and zod schemas between layers where practical, or mirror them carefully.
- Small, meaningful commits (`feat:`, `fix:`, `test:`, `docs:`).
- Do not add features beyond this plan except where marked bonus.
- If something is ambiguous, pick the simplest reasonable option and log it in `DECISIONS.md`.

## 8. Known limitations to document (be honest in the README)

- No authentication, so submissions are anonymous.
- No rate limiting or spam protection.
- No file or image uploads.
- Drafts live in the browser only (sessionStorage), not server-side.
- Render free tier cold starts add latency to the first request.
- Atlas network access is open for simplicity.

## 9. Future improvements (mention in the recording)

- Auth and ownership of requirements
- Server-side drafts
- Rate limiting and captcha
- Pagination, search and filters on the list view
- Playwright e2e tests and CI (GitHub Actions)
- Matching and notifications between requirements and performers/crew

## 10. Final checklist before submission

- [ ] Live frontend URL works from an incognito window
- [ ] All 3 category flows saved correctly in MongoDB
- [ ] GitHub repo is public (or shared), with a clear README
- [ ] Tests pass
- [ ] `DECISIONS.md` is up to date
- [ ] Screen recording script prepared from `DECISIONS.md`
