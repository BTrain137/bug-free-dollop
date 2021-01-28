CREATE DATABASE IF NOT EXISTS `fitlife`;
USE `fitlife`;

DROP TABLE IF EXISTS `general_logs`;
CREATE TABLE `general_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` BIGINT,
  `customer_email` VARCHAR(100),
  `action` VARCHAR(50),
  `route` VARCHAR(50),
  `function_name` VARCHAR(255),
  `notes` VARCHAR(100),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `json_data` TEXT,
  PRIMARY KEY(`id`)
);
