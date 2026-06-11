# DECISIONS.md — Architecture & Implementation Decisions

## D1 — JWT Library: jjwt (io.jsonwebtoken) with HS256
**Context**: Spring Boot 4.x ships with oauth2-resource-server, but the project uses custom JWT with HMAC.
**Decision**: Use `io.jsonwebtoken:jjwt-api/impl/jackson` 0.12.x for manual JWT management with HS256.
**Rationale**: Simpler, full control over claims (sub, email, role, doctorStatus), no dependency on Spring OAuth2 resource server.

## D2 — Mappers: Hand-written static mappers (no MapStruct)
**Context**: MapStruct can have annotation-processor conflicts with Lombok on Spring Boot 4.x.
**Decision**: Use hand-written mapper classes with static methods.
**Rationale**: Avoids build complexity; the DTOs are simple enough that hand-written mappers are trivial.

## D3 — Refresh Tokens: Not implemented
**Context**: Docs mention refresh tokens as optional.
**Decision**: Single access token with 1-hour expiry. No refresh token.
**Rationale**: Simplifies auth flow; acceptable for this project scope.

## D4 — Password Reset Email: Console-logged
**Context**: Docs allow stubbing email sending.
**Decision**: Log the reset link to console (SLF4J INFO). No actual email delivery.
**Rationale**: No SMTP infra needed for local dev; reset flow is still fully functional.

## D5 — Tailwind CSS: Version 4 (CSS-first config)
**Context**: Frontend uses Vite 8 + React 19.
**Decision**: Use Tailwind CSS v4 with `@import "tailwindcss"` in index.css.
**Rationale**: v4 is current, works with Vite 8 out of the box.

## D6 — Audit Log Transactionality
**Context**: Audit logs could be async or synchronous.
**Decision**: Synchronous within the same transaction as the business operation.
**Rationale**: Simplest approach; if business tx rolls back, audit rolls back too. Acceptable per docs.

## D7 — Doctor Deletion with Patients
**Context**: When deleting a doctor who has assigned patients.
**Decision**: Block deletion with 409 CONFLICT "Doctor has assigned patients".
**Rationale**: Safest option; avoids orphaned patient records. Reassignment is out of scope.

## D8 — Spring Boot Version: 4.0.6
**Context**: pom.xml was generated with Spring Boot 4.0.6.
**Decision**: Keep 4.0.6 and adapt code to any 4.x API changes.
**Rationale**: Already scaffolded; 4.x is the latest stable line.

## D9 — Model Artifact: Committed to repo
**Context**: ML model can be built at Docker build time or committed.
**Decision**: Commit `model/model.joblib` to repo after training.
**Rationale**: Simpler local setup; model is deterministic (random_state=42).
