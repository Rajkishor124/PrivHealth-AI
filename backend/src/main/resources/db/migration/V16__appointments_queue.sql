-- ============================================================
-- V16: Appointments, Scheduling & Patient Queue Management
-- ============================================================

-- 1. Doctor Availability (weekly schedule)
CREATE TABLE doctor_availability (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES users(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL DEFAULT '09:00',
    end_time TIME NOT NULL DEFAULT '17:00',
    max_appointments_per_slot INT NOT NULL DEFAULT 20,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_doctor_day UNIQUE (doctor_id, day_of_week)
);

CREATE INDEX idx_doctor_availability_doctor ON doctor_availability(doctor_id);
CREATE INDEX idx_doctor_availability_hospital ON doctor_availability(hospital_id);

-- 2. Appointments
CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    appointment_number VARCHAR(50) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    doctor_id BIGINT NOT NULL REFERENCES users(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason_for_visit TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_hospital ON appointments(hospital_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);

-- 3. Patient Queue
CREATE TABLE patient_queue (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL REFERENCES appointments(id),
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    doctor_id BIGINT NOT NULL REFERENCES users(id),
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id),
    token_number VARCHAR(20) NOT NULL,
    queue_position INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    called_time TIMESTAMPTZ,
    consultation_start_time TIMESTAMPTZ,
    completed_time TIMESTAMPTZ
);

CREATE INDEX idx_patient_queue_doctor ON patient_queue(doctor_id);
CREATE INDEX idx_patient_queue_hospital ON patient_queue(hospital_id);
CREATE INDEX idx_patient_queue_status ON patient_queue(status);
CREATE INDEX idx_patient_queue_checkin ON patient_queue(check_in_time);
CREATE INDEX idx_patient_queue_doctor_date ON patient_queue(doctor_id, check_in_time);
