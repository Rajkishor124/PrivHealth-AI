ALTER TABLE hospitals DROP CONSTRAINT IF EXISTS hospitals_subscription_plan_id_fkey;
ALTER TABLE subscription_plans ALTER COLUMN id TYPE BIGINT;
ALTER TABLE hospitals ALTER COLUMN subscription_plan_id TYPE BIGINT;
ALTER TABLE hospitals ADD CONSTRAINT hospitals_subscription_plan_id_fkey FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id);
