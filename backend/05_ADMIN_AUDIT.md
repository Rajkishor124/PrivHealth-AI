# backend/05_ADMIN_AUDIT.md — Admin Workflows, Analytics, Audit Viewer

All endpoints `hasRole('ADMIN')` (route + method level).

## Doctor approval

- `GET /api/admin/doctors/pending` → users where role=DOCTOR and doctorStatus=PENDING,
  ordered oldest first (FIFO queue).
- `PUT /api/admin/doctors/{id}/approve` → must currently be PENDING (else 404
  `RESOURCE_NOT_FOUND` with message "No pending doctor with id"). Set APPROVED, audit
  `DOCTOR_APPROVED`.
- `PUT /api/admin/doctors/{id}/reject` → same precondition; set REJECTED, audit
  `DOCTOR_REJECTED`.
- Approval takes effect on the doctor's NEXT request even with an old JWT, because
  doctor-approval checks read `doctorStatus` fresh from DB in the auth filter or guard
  (load user by id in `JwtAuthFilter`; do not trust the status claim for enforcement).

## User management

- `GET /api/admin/users?role=&page=&size=` → paginated `UserResponse` (no password field
  ever). Optional role filter.
- `DELETE /api/admin/users/{id}`:
  - Cannot delete self → 409 `CONFLICT` "Cannot delete your own account".
  - Cannot delete the last remaining ADMIN → 409.
  - Deleting a doctor: their patients remain (FK to users) — either reassign-on-delete is
    out of scope; block deletion if doctor has patients → 409 with message
    "Doctor has assigned patients" (simplest safe rule; record in DECISIONS.md).
  - Deleting a patient user: unlink (`patients.user_id = NULL`) then delete.
  - Audit `USER_DELETED`.

## Analytics — GET /api/admin/analytics

Single service method with grouped queries (no loading whole tables):
- counts: users, doctors, pendingDoctors, patients, predictions.
- `riskDistribution`: `SELECT risk_category, COUNT(*) GROUP BY risk_category`
  (include zero-count categories in the map).
- `predictionsLast30Days`: count grouped by `DATE(created_at)` for last 30 days,
  fill missing dates with 0 in Java.
Shape per `API_CONTRACT.md §6`.

## Audit log viewer — GET /api/admin/audit-logs

Paginated, newest first, optional `userId` filter. Response item:
```json
{ "id": 1, "userId": 12, "userName": "Dr. Asha Rao", "action": "PATIENT_CREATED",
  "entityType": "PATIENT", "entityId": 7, "details": null,
  "ipAddress": "10.0.0.5", "createdAt": "..." }
```
`userName` resolved via join (LEFT JOIN — user may be deleted → null + show "deleted user"
on frontend).

## Tests
- Approve/reject preconditions; stale-JWT approval takes effect.
- Self-delete and last-admin guards.
- Analytics numbers against seeded fixture data.
