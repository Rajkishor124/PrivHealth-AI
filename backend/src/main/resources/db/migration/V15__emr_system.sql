-- ============================================================
-- V15: Electronic Medical Records (EMR) System
-- ============================================================

-- 1. Consultations
CREATE TABLE consultations (
    id BIGSERIAL PRIMARY KEY,
    consultation_number VARCHAR(50) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    doctor_id BIGINT NOT NULL REFERENCES users(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    consultation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    consultation_type VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
    chief_complaint TEXT,
    consultation_notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX idx_consultations_hospital ON consultations(hospital_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_date ON consultations(consultation_date DESC);

-- 2. Diagnoses
CREATE TABLE diagnoses (
    id BIGSERIAL PRIMARY KEY,
    consultation_id BIGINT NOT NULL REFERENCES consultations(id),
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    doctor_id BIGINT NOT NULL REFERENCES users(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    diagnosis_code VARCHAR(20),
    diagnosis_name VARCHAR(255) NOT NULL,
    diagnosis_description TEXT,
    severity VARCHAR(20) NOT NULL DEFAULT 'MODERATE',
    diagnosis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_diagnoses_consultation ON diagnoses(consultation_id);
CREATE INDEX idx_diagnoses_patient ON diagnoses(patient_id);
CREATE INDEX idx_diagnoses_hospital ON diagnoses(hospital_id);

-- 3. Prescriptions
CREATE TABLE prescriptions (
    id BIGSERIAL PRIMARY KEY,
    consultation_id BIGINT NOT NULL REFERENCES consultations(id),
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    doctor_id BIGINT NOT NULL REFERENCES users(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_consultation ON prescriptions(consultation_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_hospital ON prescriptions(hospital_id);

-- 4. Prescription Medicines (line items)
CREATE TABLE prescription_medicines (
    id BIGSERIAL PRIMARY KEY,
    prescription_id BIGINT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT
);

CREATE INDEX idx_prescription_medicines_rx ON prescription_medicines(prescription_id);

-- 5. Treatment Notes
CREATE TABLE treatment_notes (
    id BIGSERIAL PRIMARY KEY,
    consultation_id BIGINT NOT NULL REFERENCES consultations(id),
    doctor_id BIGINT NOT NULL REFERENCES users(id),
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_treatment_notes_consultation ON treatment_notes(consultation_id);
CREATE INDEX idx_treatment_notes_patient ON treatment_notes(patient_id);
CREATE INDEX idx_treatment_notes_hospital ON treatment_notes(hospital_id);

-- 6. Medical Reports
CREATE TABLE medical_reports (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    doctor_id BIGINT NOT NULL REFERENCES users(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    report_title VARCHAR(255) NOT NULL,
    report_type VARCHAR(20) NOT NULL DEFAULT 'CONSULTATION',
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    summary TEXT,
    attachment_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medical_reports_patient ON medical_reports(patient_id);
CREATE INDEX idx_medical_reports_hospital ON medical_reports(hospital_id);
CREATE INDEX idx_medical_reports_type ON medical_reports(report_type);
