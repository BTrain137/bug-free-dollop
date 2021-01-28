CREATE DATABASE IF NOT EXISTS `fitlife`;
USE `fitlife`;

DROP TABLE IF EXISTS `surprise_and_delight`;
CREATE TABLE `surprise_and_delight` (
  `order_number` INT NOT NULL,
  `item_title` VARCHAR(50) NOT NULL,
  `cost` FLOAT,
  `variant_id` VARCHAR(20) NOT NULL,
  PRIMARY KEY(`order_number`)
);
