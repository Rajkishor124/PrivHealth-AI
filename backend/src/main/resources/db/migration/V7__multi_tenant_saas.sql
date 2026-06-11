-- Update roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
UPDATE users SET role = 'SUPER_ADMIN' WHERE role = 'ADMIN';

-- Create subscription_plans table
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    max_patients INT NOT NULL,
    max_doctors INT NOT NULL,
    price_monthly DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create hospitals table
CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    hospital_code VARCHAR(100) UNIQUE NOT NULL,
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    subscription_plan_id INT REFERENCES subscription_plans(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Legacy Hospital
INSERT INTO hospitals (name, hospital_code, address, status)
VALUES ('Legacy Central Hospital', 'LEGACY-001', 'Legacy Address', 'ACTIVE');

-- Add hospital_id to users, patients, predictions, audit_logs
ALTER TABLE users ADD COLUMN hospital_id INT REFERENCES hospitals(id);
ALTER TABLE patients ADD COLUMN hospital_id INT REFERENCES hospitals(id);
ALTER TABLE predictions ADD COLUMN hospital_id INT REFERENCES hospitals(id);
ALTER TABLE audit_logs ADD COLUMN hospital_id INT REFERENCES hospitals(id);

-- Assign Legacy Hospital to all existing data EXCEPT Super Admins
UPDATE users SET hospital_id = (SELECT id FROM hospitals WHERE hospital_code = 'LEGACY-001')
WHERE role != 'SUPER_ADMIN';

UPDATE patients SET hospital_id = (SELECT id FROM hospitals WHERE hospital_code = 'LEGACY-001');

UPDATE predictions SET hospital_id = (SELECT id FROM hospitals WHERE hospital_code = 'LEGACY-001');

UPDATE audit_logs SET hospital_id = (SELECT id FROM hospitals WHERE hospital_code = 'LEGACY-001');
