-- V2__seed_admin.sql
-- Idempotent admin seed: password is BCrypt hash of 'Admin123!'
INSERT INTO users (name, email, password, role, doctor_status)
SELECT 'System Admin', 'admin@privhealth.com',
       '$2a$12$LJ3m4ys3LzHKbFQXSuBtOeDPTEWKSnVHqRkL7JKgMRmhFJNBMUwHu',
       'ADMIN', NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@privhealth.com');
