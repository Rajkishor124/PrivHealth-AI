-- V5__audit_logs.sql
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(60) NOT NULL,
    entity_type VARCHAR(40) NULL,
    entity_id   BIGINT NULL,
    details     TEXT NULL,
    ip_address  VARCHAR(45) NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
