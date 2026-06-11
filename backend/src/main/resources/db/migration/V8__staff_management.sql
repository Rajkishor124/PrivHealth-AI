ALTER TABLE users DROP CONSTRAINT IF EXISTS users_doctor_status_check;
ALTER TABLE users ADD COLUMN employee_id VARCHAR(50);
ALTER TABLE users ADD COLUMN specialization VARCHAR(100);
ALTER TABLE users ADD COLUMN qualification VARCHAR(100);
ALTER TABLE users ADD COLUMN years_of_experience INT;
ALTER TABLE users ADD COLUMN medical_license_number VARCHAR(100);
ALTER TABLE users ADD COLUMN joining_date DATE;
ALTER TABLE users ADD COLUMN department VARCHAR(100);
ALTER TABLE users ADD COLUMN designation VARCHAR(100);

ALTER TABLE users RENAME COLUMN doctor_status TO staff_status;
