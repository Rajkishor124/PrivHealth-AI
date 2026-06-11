-- ============================================================
-- V17: Patient Symptom Tracking, Vitals Monitoring & AI Data Collection
-- ============================================================

-- 1. Symptom Master (Catalog)
CREATE TABLE symptom_master (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Seed initial symptoms
INSERT INTO symptom_master (name, category, description, active) VALUES
('Fever', 'GENERAL', 'High body temperature', true),
('Headache', 'NEUROLOGICAL', 'Pain or discomfort in the head or face', true),
('Chest Pain', 'CARDIAC', 'Pain, pressure, or tightness in the chest', true),
('Fatigue', 'GENERAL', 'Extreme tiredness or lack of energy', true),
('Shortness of Breath', 'RESPIRATORY', 'Difficulty breathing or feeling winded', true),
('Dizziness', 'NEUROLOGICAL', 'Feeling lightheaded, unsteady, or faint', true),
('Nausea', 'GENERAL', 'Sensation of unease in the stomach with an urge to vomit', true),
('Weight Loss', 'GENERAL', 'Unintentional weight loss', true),
('Cough', 'RESPIRATORY', 'Repetitive reflex to clear breathing passages', true),
('Joint Pain', 'OTHER', 'Discomfort, pain, or inflammation in joints', true);


-- 2. Patient Symptoms
CREATE TABLE patient_symptoms (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    symptom_id BIGINT NOT NULL REFERENCES symptom_master(id),
    severity VARCHAR(20) NOT NULL,
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patient_symptoms_patient ON patient_symptoms(patient_id);
CREATE INDEX idx_patient_symptoms_hospital ON patient_symptoms(hospital_id);
CREATE INDEX idx_patient_symptoms_recorded_at ON patient_symptoms(recorded_at);


-- 3. Patient Vitals
CREATE TABLE patient_vitals (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    heart_rate INT,
    oxygen_saturation INT,
    temperature DOUBLE PRECISION,
    blood_sugar INT,
    weight DOUBLE PRECISION,
    height DOUBLE PRECISION,
    bmi DOUBLE PRECISION,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patient_vitals_patient ON patient_vitals(patient_id);
CREATE INDEX idx_patient_vitals_hospital ON patient_vitals(hospital_id);
CREATE INDEX idx_patient_vitals_recorded_at ON patient_vitals(recorded_at DESC);


-- 4. Health Journals
CREATE TABLE health_journals (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    mood VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_journals_patient ON health_journals(patient_id);
CREATE INDEX idx_health_journals_hospital ON health_journals(hospital_id);


-- 5. Health Alerts
CREATE TABLE health_alerts (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_alerts_patient ON health_alerts(patient_id);
CREATE INDEX idx_health_alerts_hospital ON health_alerts(hospital_id);
CREATE INDEX idx_health_alerts_severity ON health_alerts(severity);
