-- V3__patients.sql
CREATE TABLE patients (
    id                          BIGSERIAL PRIMARY KEY,
    doctor_id                   BIGINT NOT NULL REFERENCES users(id),
    user_id                     BIGINT NULL REFERENCES users(id),
    name                        VARCHAR(120) NOT NULL,
    age                         INT NOT NULL CHECK (age BETWEEN 0 AND 120),
    gender                      VARCHAR(10) NOT NULL CHECK (gender IN ('MALE','FEMALE','OTHER')),
    encrypted_medical_history   TEXT NOT NULL,
    medical_history_hmac        VARCHAR(128) NOT NULL,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patients_doctor ON patients(doctor_id);
CREATE INDEX idx_patients_user   ON patients(user_id);
