-- V18__ai_risk_predictions.sql
CREATE TABLE model_registry (
    id BIGSERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL UNIQUE,
    training_date TIMESTAMP WITH TIME ZONE NOT NULL,
    accuracy DOUBLE PRECISION,
    precision_score DOUBLE PRECISION,
    recall DOUBLE PRECISION,
    f1_score DOUBLE PRECISION,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risk_assessments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    target_disease VARCHAR(100) NOT NULL,
    risk_category VARCHAR(50) NOT NULL,
    risk_score DOUBLE PRECISION NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    prediction_summary TEXT,
    recommendations TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risk_assessment_explanations (
    id BIGSERIAL PRIMARY KEY,
    risk_assessment_id BIGINT NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    contribution_value DOUBLE PRECISION NOT NULL
);

CREATE TABLE risk_alerts (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_risk_assessments_patient ON risk_assessments(patient_id);
CREATE INDEX idx_risk_assessments_hospital ON risk_assessments(hospital_id);
CREATE INDEX idx_risk_alerts_patient ON risk_alerts(patient_id);
CREATE INDEX idx_risk_alerts_hospital ON risk_alerts(hospital_id);

INSERT INTO model_registry (model_name, version, training_date, accuracy, precision_score, recall, f1_score, is_active)
VALUES ('RandomForestClassifier_DiseaseRisk', 'v1.0.0', CURRENT_TIMESTAMP, 0.85, 0.82, 0.88, 0.85, TRUE);
