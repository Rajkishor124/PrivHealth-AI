-- V4__predictions_explanations.sql
CREATE TABLE predictions (
    id                    BIGSERIAL PRIMARY KEY,
    patient_id            BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    risk_score            DOUBLE PRECISION NOT NULL CHECK (risk_score BETWEEN 0 AND 1),
    risk_category         VARCHAR(10) NOT NULL CHECK (risk_category IN ('LOW','MODERATE','HIGH')),
    input_age             INT NOT NULL,
    input_blood_pressure  INT NOT NULL,
    input_cholesterol     INT NOT NULL,
    input_diabetes        BOOLEAN NOT NULL,
    input_bmi             DOUBLE PRECISION NOT NULL,
    input_heart_rate      INT NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
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
