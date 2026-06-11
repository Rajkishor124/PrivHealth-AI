ALTER TABLE hospitals RENAME COLUMN contact_email TO email;
ALTER TABLE hospitals RENAME COLUMN contact_phone TO phone;
ALTER TABLE hospitals ADD COLUMN city VARCHAR(100);
ALTER TABLE hospitals ADD COLUMN state VARCHAR(100);
ALTER TABLE hospitals ADD COLUMN country VARCHAR(100);
