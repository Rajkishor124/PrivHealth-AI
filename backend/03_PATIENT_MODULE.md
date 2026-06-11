# backend/03_PATIENT_MODULE.md — Patient CRUD with Encryption

## Entities & DTOs

`Patient` entity fields: id, doctorId (or `@ManyToOne User doctor`), userId (nullable),
name, age, gender (enum), encryptedMedicalHistory, medicalHistoryHmac, createdAt.

DTOs:
- `PatientRequest { name, age, gender, medicalHistory, userEmail? }` — validated:
  `@NotBlank name (≤120)`, `@Min(0) @Max(120) age`, `@NotNull gender`,
  `@NotBlank medicalHistory (≤10000)`, `userEmail` optional valid email.
- `PatientResponse` per `API_CONTRACT.md §3` (decrypted `medicalHistory`).
- `PatientSummaryResponse { id, name, age, gender, createdAt, lastRiskCategory? }`
  for list views (no medical history in lists — minimize PHI exposure).

## Service behavior

### create(principal, request)
1. Require approved doctor.
2. If `userEmail` present: find user with role PATIENT; not found → 400
   `BAD_REQUEST` "No patient account with that email"; link `userId`.
3. Encrypt + HMAC medical history; save; audit `PATIENT_CREATED`.

### list(principal, page, size, search)
- DOCTOR → `findByDoctorId` (+ name contains search); ADMIN → all.
- Return summaries with `lastRiskCategory` from most recent prediction
  (single query with subquery/`@Query`, avoid N+1).

### get(principal, id)
- Load; authorize: owner doctor, admin, or linked patient user; else 404.
- Decrypt + verify HMAC → full response.

### update(principal, id) / delete(principal, id)
- Owner doctor only (admin may delete). Re-encrypt on update. Audit
  `PATIENT_UPDATED` / `PATIENT_DELETED`. Delete cascades predictions/explanations (FK).

## Controller

`@RestController @RequestMapping("/api/patients")` — thin: `@Valid` body, principal,
delegate, wrap in `ApiResponse`. Paginated list returns `meta` per envelope.

## Edge cases to handle
- Duplicate-link attempt: a PATIENT user already linked to another patient record of the
  same doctor → 409 `CONFLICT`.
- Age/gender invalid → 400 field errors.
- HMAC mismatch on read → 500 `DATA_INTEGRITY_VIOLATION` (and log WARN with patient id,
  never the data).

## Tests
- Ownership matrix (doctorA/doctorB/admin/patient-linked/patient-unlinked × CRUD).
- Ciphertext-at-rest assertion: repository value != plaintext and decrypts correctly.
