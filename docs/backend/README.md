# backend/README.md — Spring Boot Service Overview

Java 21 · Spring Boot (latest stable; if 4.0.x unavailable in archetype, use latest 3.x and
record in DECISIONS.md) · Maven · PostgreSQL · Flyway · Spring Security + JWT.

---

## Package layout (base: `com.privhealth.backend`)

```
auth/        controller, service, repository, dto, mapper, entity   ← register/login/me/reset
user/        controller, service, repository, dto, mapper, entity   ← user CRUD internals
patient/     controller, service, repository, dto, mapper, entity
prediction/  controller, service, repository, dto, mapper, entity
explanation/ controller, service, repository, dto, mapper, entity
admin/       controller, service, dto                               ← approvals, analytics
audit/       service, repository, entity (+controller for admin log viewer)
privacy/     encryption/ (AES-GCM), hashing/ (BCrypt config), hmac/ (HMAC-SHA256)
security/    jwt/ (provider, props), filter/ (JwtAuthFilter), config/ (SecurityConfig), service/ (UserDetailsServiceImpl)
ml/          client/ (MlClient), dto/ (MlPredictRequest/Response)
common/      exception/ (GlobalExceptionHandler, domain exceptions),
             response/ (ApiResponse envelope, PageMeta),
             constants/, util/
config/      database/, swagger/ (springdoc-openapi), app/ (CORS, properties)
```

Layer rules:
- `controller → service → repository`. Controllers never touch repositories.
- DTO ↔ entity mapping in `mapper/` only.
- Cross-module access via that module's service interface, never its repository.

---

## Key conventions

| Concern | Convention |
|---|---|
| Response shape | `ApiResponse<T>` envelope everywhere (see `API_CONTRACT.md §1`) |
| Errors | Domain exceptions (`ResourceNotFoundException`, `AccessDeniedException`, `EmailExistsException`, `MlServiceException`, `DataIntegrityException`) handled in one `@RestControllerAdvice` |
| Security | `SecurityFilterChain` + `@EnableMethodSecurity`; `@PreAuthorize("hasRole('DOCTOR')")` etc. on service or controller methods |
| Current user | `@AuthenticationPrincipal` custom `UserPrincipal` exposing id, role, doctorStatus |
| Validation | Jakarta validation on DTOs; method param validation on path ids |
| Logging | SLF4J; never log PHI plaintext, tokens, or password hashes |
| API docs | springdoc-openapi at `/swagger-ui.html`, secured off in prod |
| Tests | JUnit 5 + Mockito for services; `@SpringBootTest` + Testcontainers for controllers |

---

## Environment variables (`.env.example`)

```
DB_URL=jdbc:postgresql://localhost:5432/privhealth
DB_USERNAME=privhealth
DB_PASSWORD=privhealth
JWT_SECRET=<base64 256-bit>
JWT_EXPIRATION_SECONDS=3600
AES_KEY=<base64 256-bit>
HMAC_KEY=<base64 256-bit>
ML_SERVICE_URL=http://localhost:8000
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Profiles: `local` (default, verbose errors), `prod` (Flyway validate, sanitized errors).

Build guides in order: `01_SETUP.md` → `02_AUTH_SECURITY.md` → `03_PATIENT_MODULE.md`
→ `04_PREDICTION_EXPLANATION.md` → `05_ADMIN_AUDIT.md`.
