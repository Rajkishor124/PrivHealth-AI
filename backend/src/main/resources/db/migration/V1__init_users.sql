-- V1__init_users.sql
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(120)  NOT NULL,
    email           VARCHAR(255)  NOT NULL UNIQUE,
    password        VARCHAR(100)  NOT NULL,
    role            VARCHAR(20)   NOT NULL CHECK (role IN ('ADMIN','DOCTOR','PATIENT')),
    doctor_status   VARCHAR(20)   NULL CHECK (doctor_status IN ('PENDING','APPROVED','REJECTED')),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
