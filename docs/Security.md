# PrivHealth AI - Security Architecture

## 1. Authentication (JWT & RBAC)
- **Token**: Stateless JWT issued upon login.
- **Roles**: `ADMIN`, `DOCTOR`, `PATIENT`.
- **Validation**: `JwtAuthFilter` executes on every request (except public endpoints).
- **Enforcement**: Method-level security (`@PreAuthorize`) and URL-based rules in `SecurityConfig`.

## 2. Data Encryption at Rest (AES-256-GCM)
- Patient medical histories are encrypted at the application level before being saved to PostgreSQL.
- We use **AES-256-GCM** to ensure both confidentiality and integrity.
- **HMAC (SHA-256)** signatures are appended to ciphertext to detect tampering.
- Even if a malicious actor gains direct DB access, patient data remains unreadable.

## 3. Data Ownership & Tenancy
- Doctors are strictly limited to viewing/modifying their own mapped patients.
- Patients can only view predictions linked to their own account.
- Handled securely at the service layer by comparing `patient.getDoctor().getId()` with the `UserPrincipal`.

## 4. Operational Security
- **No Stack Traces**: The production profile (`application-prod.yml`) suppresses all stack traces via `server.error.include-stacktrace: never`.
- **Global Exception Handling**: All exceptions map to a generic `ApiResponse` envelope, preventing internal state leakage.
- **Audit Logging**: Sensitive actions (e.g., Registrations, Logins, Password Resets, Data access) are logged to the `audit_logs` table for compliance tracking.
