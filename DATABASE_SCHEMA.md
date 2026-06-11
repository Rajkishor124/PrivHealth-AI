# DATABASE_SCHEMA.md — PostgreSQL Schema & Flyway Migration Plan

Database: `privhealth` (PostgreSQL 16). All migrations in
`backend/src/main/resources/db/migration/`. Local profile: Flyway runs on startup,
`spring.jpa.hibernate.ddl-auto=validate`.

---

## Migration files

| File | Contents |
|---|---|
| `V1__init_users.sql` | users table + enums |
| `V2__seed_admin.sql` | idempotent admin seed (bcrypt hash via app or precomputed) |
| `V3__patients.sql` | patients table |
| `V4__predictions_explanations.sql` | predictions + explanations |
| `V5__audit_logs.sql` | audit_logs |
| `V6__password_reset_tokens.sql` | reset tokens (if token-table approach chosen) |

---

## DDL

```sql
-- V1
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(120)  NOT NULL,
    email           VARCHAR(255)  NOT NULL UNIQUE,
    password        VARCHAR(100)  NOT NULL,            -- BCrypt hash
    role            VARCHAR(20)   NOT NULL CHECK (role IN ('ADMIN','DOCTOR','PATIENT')),
    doctor_status   VARCHAR(20)   NULL  CHECK (doctor_status IN ('PENDING','APPROVED','REJECTED')),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role ON users(role);

-- V3
CREATE TABLE patients (
    id                          BIGSERIAL PRIMARY KEY,
    doctor_id                   BIGINT NOT NULL REFERENCES users(id),
    user_id                     BIGINT NULL REFERENCES users(id),  -- linked PATIENT account
    name                        VARCHAR(120) NOT NULL,
    age                         INT NOT NULL CHECK (age BETWEEN 0 AND 120),
    gender                      VARCHAR(10) NOT NULL CHECK (gender IN ('MALE','FEMALE','OTHER')),
    encrypted_medical_history   TEXT NOT NULL,   -- base64(iv || ciphertext)
    medical_history_hmac        VARCHAR(128) NOT NULL, -- hex HMAC-SHA256 of plaintext
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_patients_doctor ON patients(doctor_id);
CREATE INDEX idx_patients_user   ON patients(user_id);

-- V4
CREATE TABLE predictions (
    id              BIGSERIAL PRIMARY KEY,
    patient_id      BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    risk_score      DOUBLE PRECISION NOT NULL CHECK (risk_score BETWEEN 0 AND 1),
    risk_category   VARCHAR(10) NOT NULL CHECK (risk_category IN ('LOW','MODERATE','HIGH')),
    input_age             INT NOT NULL,
    input_blood_pressure  INT NOT NULL,
    input_cholesterol     INT NOT NULL,
    input_diabetes        BOOLEAN NOT NULL,
    input_bmi             DOUBLE PRECISION NOT NULL,
    input_heart_rate      INT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_predictions_patient ON predictions(patient_id);
CREATE INDEX idx_predictions_created ON predictions(created_at DESC);

CREATE TABLE explanations (
    id              BIGSERIAL PRIMARY KEY,
    prediction_id   BIGINT NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
    feature_name    VARCHAR(50) NOT NULL,
    contribution    DOUBLE PRECISION NOT NULL,
    base_value      DOUBLE PRECISION NOT NULL
);
CREATE INDEX idx_explanations_prediction ON explanations(prediction_id);

-- V5
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(60) NOT NULL,        -- e.g. PATIENT_CREATED, LOGIN_SUCCESS
    entity_type VARCHAR(40) NULL,            -- USER / PATIENT / PREDICTION
    entity_id   BIGINT NULL,
    details     TEXT NULL,                   -- never include PHI plaintext
    ip_address  VARCHAR(45) NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- V6 (if chosen)
CREATE TABLE password_reset_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(128) NOT NULL UNIQUE,   -- store hash, not raw token
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN NOT NULL DEFAULT FALSE
);
```

---

## Rules

1. Enums stored as VARCHAR + CHECK constraints, mapped with `@Enumerated(EnumType.STRING)`.
2. Prediction inputs are denormalized onto the prediction row — predictions must be
   reproducible snapshots even if the patient record changes.
3. `details` in audit_logs must NEVER contain decrypted medical history.
4. All FKs to predictions/explanations cascade on delete; patient delete cascades down.
5. Use `TIMESTAMPTZ`, set `createdAt` via `@CreationTimestamp` or DB default.
6. Audit action vocabulary (use exactly these strings):
   `LOGIN_SUCCESS, LOGIN_FAILED, USER_REGISTERED, USER_DELETED,
    DOCTOR_APPROVED, DOCTOR_REJECTED,
    PATIENT_CREATED, PATIENT_UPDATED, PATIENT_DELETED,
    PREDICTION_CREATED, PREDICTION_DELETED,
    PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED`
