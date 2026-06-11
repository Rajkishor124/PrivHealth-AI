ALTER TABLE users DROP CONSTRAINT IF EXISTS users_hospital_id_fkey;
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_hospital_id_fkey;
ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_hospital_id_fkey;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_hospital_id_fkey;

ALTER TABLE hospitals ALTER COLUMN id TYPE BIGINT;
ALTER TABLE users ALTER COLUMN hospital_id TYPE BIGINT;
ALTER TABLE patients ALTER COLUMN hospital_id TYPE BIGINT;
ALTER TABLE predictions ALTER COLUMN hospital_id TYPE BIGINT;
ALTER TABLE audit_logs ALTER COLUMN hospital_id TYPE BIGINT;

ALTER TABLE users ADD CONSTRAINT users_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id);
ALTER TABLE patients ADD CONSTRAINT patients_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id);
ALTER TABLE predictions ADD CONSTRAINT predictions_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id);
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id);
