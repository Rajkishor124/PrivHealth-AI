-- 1. Alter subscription_plans to add missing columns
ALTER TABLE subscription_plans
    ADD COLUMN description VARCHAR(255),
    ADD COLUMN yearly_price DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    ADD COLUMN max_storage_gb INT DEFAULT 10 NOT NULL,
    ADD COLUMN max_predictions_per_month INT DEFAULT 100 NOT NULL;

-- 2. Create hospital_subscriptions table
CREATE TABLE hospital_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    hospital_id BIGINT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    subscription_plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- TRIAL, ACTIVE, EXPIRED, SUSPENDED, CANCELLED
    auto_renew BOOLEAN DEFAULT TRUE NOT NULL,
    trial_start_date DATE,
    trial_end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create usage_metrics table
CREATE TABLE usage_metrics (
    id BIGSERIAL PRIMARY KEY,
    hospital_id BIGINT UNIQUE NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    current_doctors INT DEFAULT 0 NOT NULL,
    current_patients INT DEFAULT 0 NOT NULL,
    current_storage_usage_gb DECIMAL(10, 3) DEFAULT 0.000 NOT NULL,
    current_predictions INT DEFAULT 0 NOT NULL,
    current_appointments INT DEFAULT 0 NOT NULL,
    current_consultations INT DEFAULT 0 NOT NULL,
    billing_cycle_start DATE NOT NULL,
    billing_cycle_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create platform_settings table
CREATE TABLE platform_settings (
    id BIGSERIAL PRIMARY KEY,
    platform_name VARCHAR(150) DEFAULT 'PrivHealth AI' NOT NULL,
    support_email VARCHAR(255) DEFAULT 'support@privhealth.ai' NOT NULL,
    default_trial_days INT DEFAULT 14 NOT NULL,
    maintenance_mode BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Seed initial data
-- We'll just define basic seed logic for the existing Legacy Hospital (id = 1)
-- Make sure the ENTERPRISE plan exists, then assign it.
INSERT INTO subscription_plans (id, name, description, max_doctors, max_patients, max_storage_gb, max_predictions_per_month, monthly_price, yearly_price, active)
VALUES 
(1, 'BASIC', 'For small clinics', 5, 50, 5, 100, 99.00, 999.00, TRUE),
(2, 'PROFESSIONAL', 'For medium hospitals', 20, 500, 20, 1000, 299.00, 2999.00, TRUE),
(3, 'ENTERPRISE', 'For large health networks', 100, 5000, 100, 10000, 999.00, 9999.00, TRUE)
ON CONFLICT (id) DO UPDATE SET 
    description = EXCLUDED.description, 
    yearly_price = EXCLUDED.yearly_price, 
    max_storage_gb = EXCLUDED.max_storage_gb, 
    max_predictions_per_month = EXCLUDED.max_predictions_per_month;

-- Seed hospital_subscriptions for the legacy hospital (ID=1)
INSERT INTO hospital_subscriptions (hospital_id, subscription_plan_id, start_date, end_date, status, auto_renew)
VALUES (1, 3, CURRENT_DATE, CURRENT_DATE + INTERVAL '10 years', 'ACTIVE', TRUE)
ON CONFLICT DO NOTHING;

-- Seed platform_settings
INSERT INTO platform_settings (platform_name, support_email, default_trial_days, maintenance_mode)
VALUES ('PrivHealth AI', 'support@privhealth.ai', 14, FALSE)
ON CONFLICT DO NOTHING;
