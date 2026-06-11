# BUILD_ORDER.md — Phase Plan with Acceptance Criteria

Build phases strictly in order. A phase is DONE only when every checkbox passes.

---

## Phase 0 — Repository & Infrastructure Bootstrap

Tasks:
1. Create monorepo layout (`backend/`, `frontend/`, `ml-service/`, `docs/`).
2. `docker-compose.yml` with PostgreSQL 16 (db: `privhealth`, user/pass from `.env`).
3. Root `README.md` skeleton + `.gitignore` (Java, Node, Python).
4. `.env.example` for all three services.

Acceptance:
- [ ] `docker compose up -d` starts Postgres; `psql` connects.
- [ ] Repo tree matches `00_MASTER_PROMPT.md` layout.

---

## Phase 1 — Backend Foundation: Auth, JWT, Roles

Read: `backend/01_SETUP.md`, `backend/02_AUTH_SECURITY.md`, `API_CONTRACT.md §2`,
`DATABASE_SCHEMA.md` (V1 migration).

Tasks:
1. Spring Boot project (Java 21, Maven) with deps: web, security, data-jpa, validation,
   postgresql, flyway, lombok, jjwt (or spring-security oauth2-jose).
2. Flyway `V1__init_users.sql` → `users` table.
3. Entities/DTOs/mappers for user + auth.
4. `POST /api/auth/register` (role: DOCTOR or PATIENT; doctors start `PENDING`).
5. `POST /api/auth/login` → JWT access token (+ refresh optional, record in DECISIONS.md).
6. `GET /api/auth/me`.
7. `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
   (token table or signed token; email sending may be stubbed/logged — record decision).
8. BCrypt password encoding; global exception handler; response envelope.
9. Seed admin user via `CommandLineRunner` (idempotent) or `V2__seed_admin.sql`.

Acceptance:
- [ ] Register doctor → `doctor_status = PENDING` in DB.
- [ ] Login returns JWT; `GET /api/auth/me` with token returns the user.
- [ ] Wrong password → 401 envelope with `code: INVALID_CREDENTIALS`.
- [ ] Accessing any protected route without token → 401.
- [ ] Unit tests for AuthService pass.

---

## Phase 2 — Patient Management + Encryption Layer

Read: `backend/03_PATIENT_MODULE.md`, `backend/02_AUTH_SECURITY.md §4`,
`API_CONTRACT.md §3`.

Tasks:
1. Flyway migration → `patients` table.
2. AES-256-GCM `EncryptionService` + `HmacService` (keys from env).
3. JPA `AttributeConverter` (or explicit service calls) for `encrypted_medical_history`.
4. Full patient CRUD with doctor-ownership enforcement.
5. PATIENT role linkage: a patient record may optionally link to a user account
   (`user_id` nullable) so patients can view their own data.
6. Audit log entries for create/update/delete.

Acceptance:
- [ ] Medical history stored in DB is ciphertext (verify via psql — not plaintext).
- [ ] Tampering with ciphertext in DB → read fails with `DATA_INTEGRITY_VIOLATION`.
- [ ] Doctor A cannot read/update/delete Doctor B's patient (404).
- [ ] Patient user can `GET` only their own patient record.
- [ ] Validation errors return 400 envelope with field errors.

---## Phase 3 — ML Service + Backend Integration

Read: `ml-service/README.md`, `backend/04_PREDICTION_EXPLANATION.md`,
`API_CONTRACT.md §4, §7`.

Tasks:
1. FastAPI service: train RandomForestClassifier on synthetic dataset at build time
   (`train.py` → `model.joblib`), `/predict` endpoint returning risk score, category,
   and SHAP contributions in one response.
2. Spring `MlClient` (RestClient/WebClient) with timeout, retry(1), and circuit-style
   fallback error `ML_SERVICE_UNAVAILABLE` (503).
3. `POST /api/predictions` orchestration: load patient → call ML → persist prediction
   + explanations atomically → return combined DTO.

Acceptance:
- [ ] `curl ml-service /predict` returns score, category, contributions summing sensibly.
- [ ] `POST /api/predictions` persists rows in `predictions` AND `explanations`.
- [ ] ML service down → 503 envelope, nothing persisted.
- [ ] Risk category boundaries match `ml-service/README.md §4` exactly.

---

## Phase 4 — Prediction History

Read: `API_CONTRACT.md §4`.

Tasks:
1. `GET /api/predictions` (role-scoped: doctor → own patients; admin → all; patient → self).
2. `GET /api/predictions/{id}`, `GET /api/predictions/patient/{patientId}`,
   `DELETE /api/predictions/{id}` (doctor-owner or admin).
3. Pagination (`page`, `size`, default 20, sorted `createdAt desc`).

Acceptance:
- [ ] Each role sees exactly its allowed scope (test all three).
- [ ] Pagination metadata present in envelope `meta`.

---

## Phase 5 — SHAP Explainability API

Read: `API_CONTRACT.md §5`.

Tasks:
1. `GET /api/explanations/{predictionId}` returns ordered feature contributions
   (desc by |contribution|) + base value + prediction summary.
2. Access scope identical to the parent prediction.

Acceptance:
- [ ] Contributions ordered by absolute magnitude.
- [ ] Patient can fetch explanations only for own predictions.

---

## Phase 6 — React Frontend (Public + Doctor + Patient)

Read: all `frontend/*.md`.

Tasks:
1. Bootstrap per `frontend/01_SETUP.md`.
2. Auth flow per `frontend/02_AUTH_ROUTING.md` (login, register, forgot/reset,
   token storage, axios interceptors, ProtectedRoute, RoleProtectedRoute).
3. Doctor dashboard: patient list/create/edit/delete, prediction form,
   prediction history, SHAP chart.
4. Patient dashboard: profile, prediction history, risk reports.
5. Landing page, 404, layouts, toasts, loading/error/empty states everywhere.

Acceptance:
- [ ] `npm run build` zero TS errors.
- [ ] Full doctor journey works end-to-end against local backend.
- [ ] Patient journey works; patient cannot navigate to doctor/admin routes
      (redirected + toast).
- [ ] Expired/invalid token → auto-logout → redirect to /login.

---

## Phase 7 — Admin Dashboard + Analytics

Read: `backend/05_ADMIN_AUDIT.md`, `API_CONTRACT.md §6`, `frontend/03_FEATURES.md §admin`.

Tasks:
1. Backend: pending doctors list, approve/reject, user list/delete,
   `GET /api/admin/analytics` (counts + risk distribution + predictions over time).
2. Frontend: analytics cards + charts, doctor approval queue, user management table,
   system reports (audit log viewer, paginated).

Acceptance:
- [ ] Pending doctor approve → doctor can use doctor endpoints; reject → 403 `DOCTOR_NOT_APPROVED`.
- [ ] Analytics numbers match DB state.
- [ ] Non-admin calling admin endpoint → 403.

---

## Phase 8 — Hardening + Deployment Prep

Tasks:
1. CORS config for deployed frontend origin (env-driven).
2. Production profiles: `application-prod.yml` (Flyway `validate`, no stack traces in
   error responses), Vite env files.
3. Dockerfiles for backend and ml-service; build instructions for Render/Railway;
   Vercel config for frontend; Neon/Supabase connection notes.
4. Final test pass + seed script + README polish.

Acceptance:
- [ ] All Definition-of-Done items in `00_MASTER_PROMPT.md` checked.
