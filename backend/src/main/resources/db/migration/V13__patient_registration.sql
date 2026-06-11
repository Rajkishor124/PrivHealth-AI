-- Migrate name to first_name
ALTER TABLE patients RENAME COLUMN name TO first_name;

-- Add new columns
ALTER TABLE patients ADD COLUMN last_name VARCHAR(100);
ALTER TABLE patients ADD COLUMN date_of_birth DATE;
ALTER TABLE patients ADD COLUMN blood_group VARCHAR(10);
ALTER TABLE patients ADD COLUMN profile_photo VARCHAR(255);
ALTER TABLE patients ADD COLUMN phone VARCHAR(50);
ALTER TABLE patients ADD COLUMN email VARCHAR(150);
ALTER TABLE patients ADD COLUMN address TEXT;
ALTER TABLE patients ADD COLUMN emergency_contact_name VARCHAR(150);
ALTER TABLE patients ADD COLUMN emergency_contact_phone VARCHAR(50);
ALTER TABLE patients ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE';

-- Set defaults for existing data
UPDATE patients SET last_name = 'Unknown' WHERE last_name IS NULL;

-- Convert existing age to approximate date_of_birth
UPDATE patients SET date_of_birth = CURRENT_DATE - (age || ' years')::interval WHERE age IS NOT NULL;

-- Drop old age column safely
ALTER TABLE patients DROP COLUMN age;

-- Make critical columns not null if desired, though we'll keep it flexible for now
ALTER TABLE patients ALTER COLUMN last_name SET NOT NULL;
ALTER TABLE patients ALTER COLUMN date_of_birth SET NOT NULL;
