CREATE DATABASE IF NOT EXISTS `fitlife`;
USE `fitlife`;

DROP TABLE IF EXISTS `error_logs`;
CREATE TABLE `error_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` BIGINT,
  `customer_email` VARCHAR(100),
  `has_been_resolved` BOOLEAN,
  `action` VARCHAR(50),
  `route` VARCHAR(50),
  `function_name` VARCHAR(255),
  `notes` VARCHAR(100),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `json_data` TEXT,
  PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `error_order_logs`;
CREATE TABLE `error_order_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` BIGINT,
  `customer_email` VARCHAR(100),
  `has_been_resolved` BOOLEAN,
  `action` VARCHAR(50),
  `route` VARCHAR(50),
  `function_name` VARCHAR(255),
  `notes` VARCHAR(100),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `json_data` TEXT,
  PRIMARY KEY(`id`)
);
