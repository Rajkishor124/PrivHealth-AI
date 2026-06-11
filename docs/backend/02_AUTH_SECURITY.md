# backend/02_AUTH_SECURITY.md — JWT, RBAC, Encryption, HMAC, Audit

## 1. Security architecture

```
Request → JwtAuthFilter (parse Bearer token → UserPrincipal → SecurityContext)
        → SecurityFilterChain route rules
        → @PreAuthorize method rules
        → DoctorApprovalGuard (approved-doctor check)
```

### SecurityConfig essentials
- Stateless sessions (`SessionCreationPolicy.STATELESS`), CSRF disabled, CORS from props.
- Public: `/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`,
  `/api/auth/reset-password`, swagger (local only), `/actuator/health`.
- `/api/admin/**` → `hasRole('ADMIN')`. Everything else → authenticated.
- Custom `AuthenticationEntryPoint` and `AccessDeniedHandler` returning the JSON envelope
  (401 `UNAUTHORIZED` / 403 `ACCESS_DENIED`) — never default HTML errors.

### JWT (security/jwt)
- HS256 with 256-bit secret from env. Claims: `sub` = userId, `email`, `role`,
  `doctorStatus`. Expiry from props.
- `JwtTokenProvider`: `generateToken(UserPrincipal)`, `validate(token)`,
  `parsePrincipal(token)`. Expired → 401 `TOKEN_EXPIRED`; malformed → 401 `TOKEN_INVALID`.
- `JwtAuthFilter extends OncePerRequestFilter`; on failure, delegate to entry point
  (do not throw raw).

### Doctor approval enforcement
Annotation `@RequireApprovedDoctor` (custom) or inline check in services: if
`principal.role == DOCTOR && principal.doctorStatus != APPROVED` → throw
`DoctorNotApprovedException` → 403 `DOCTOR_NOT_APPROVED`. Apply to all patient/prediction
write operations and doctor reads.

## 2. Auth module behavior

- **Register**: reject role ADMIN with 400. Hash password with `BCryptPasswordEncoder`
  (strength 10–12). Doctors → `doctorStatus = PENDING`. Audit `USER_REGISTERED`.
- **Login**: authenticate via `AuthenticationManager`; on success audit `LOGIN_SUCCESS`,
  on bad credentials audit `LOGIN_FAILED` (with email, NOT password) and return 401
  `INVALID_CREDENTIALS`.
- **/me**: build from `@AuthenticationPrincipal`, fresh-load user from DB so status
  changes reflect immediately.
- **Forgot/reset password**: generate 32-byte random token; store SHA-256 hash + 30-min
  expiry in `password_reset_tokens`; "send" by logging the link locally (note in
  DECISIONS.md). Reset validates token hash, unexpired, unused → set new BCrypt hash,
  mark used, audit `PASSWORD_RESET_COMPLETED`. Always return generic success on forgot
  (no user enumeration).

## 3. RBAC patterns (use consistently)

```java
@PreAuthorize("hasRole('ADMIN')")                 // admin endpoints
@PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")      // shared reads
// ownership enforced in service layer:
if (!patient.getDoctorId().equals(principal.getId()) && !principal.isAdmin())
    throw new ResourceNotFoundException("Patient", id);   // 404 to avoid leaking existence
```
Patient self-access: allow when `patient.getUserId() != null && patient.getUserId().equals(principal.getId())`.

## 4. Field encryption (privacy/)

### EncryptionService (AES-256-GCM)
- Key: 32 bytes base64 from `AES_KEY`.
- `encrypt(plaintext)`: random 12-byte IV, GCM tag 128 bits, output
  `base64(iv || ciphertext)`. `decrypt` reverses; on `AEADBadTagException` throw
  `DataIntegrityException` (500 `DATA_INTEGRITY_VIOLATION`).

### HmacService (HMAC-SHA256)
- `sign(plaintext)` → hex digest stored in `medical_history_hmac`.
- On every read: decrypt, recompute HMAC, compare constant-time
  (`MessageDigest.isEqual`); mismatch → `DataIntegrityException`.

### Wiring
Encrypt/sign in `PatientService` on create/update; decrypt/verify on read. Keep the
entity holding ciphertext + hmac fields; DTO mapper receives decrypted value from the
service (do NOT decrypt inside an entity getter — keeps crypto failures handleable).

### Key generation helper (document in README)
`openssl rand -base64 32` for AES_KEY, HMAC_KEY, JWT_SECRET.

## 5. Audit logging (audit/)

`AuditService.log(action, entityType, entityId, details, request)` — extract user from
SecurityContext (nullable for failed logins), IP from `X-Forwarded-For` fallback
`request.getRemoteAddr()`. Call synchronously inside the same transaction for mutations
(audit must not be lost on rollback ambiguity; if the business tx rolls back, the audit
row rolls back too — acceptable and simplest; record in DECISIONS.md).
Use the exact action vocabulary from `DATABASE_SCHEMA.md §Rules.6`.

## 6. Tests required for this phase
- JwtTokenProvider: generate→parse roundtrip, expired token, tampered token.
- EncryptionService: roundtrip, tampered ciphertext fails.
- HmacService: verify pass/fail.
- AuthService: register duplicate email 409, doctor pending status, login flows.
- SecurityConfig integration: 401 without token, 403 wrong role, 403 pending doctor.
