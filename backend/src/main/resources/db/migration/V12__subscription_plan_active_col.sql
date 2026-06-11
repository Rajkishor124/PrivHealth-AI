ALTER TABLE subscription_plans RENAME COLUMN price_monthly TO monthly_price;
ALTER TABLE subscription_plans ADD COLUMN active BOOLEAN DEFAULT TRUE NOT NULL;
