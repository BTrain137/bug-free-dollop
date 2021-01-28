CREATE DATABASE IF NOT EXISTS `fitlife`;
USE `fitlife`;

DROP TABLE IF EXISTS `customer_log`;
CREATE TABLE `customer_log` (
  `customer_email` VARCHAR(255),
  -- Recharge Customer Id
  `customer_id` BIGINT,
  `has_changed_meal_plan` BOOLEAN,
  `has_been_updated` BOOLEAN,
  `subscription_meal_plan` TEXT,
  `weekly_delivery_day` TEXT,
  `weekly_deliveries` TEXT,
  `add_on_products` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`customer_email`)
);
