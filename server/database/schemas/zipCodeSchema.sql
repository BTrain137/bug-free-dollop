CREATE DATABASE IF NOT EXISTS `fitlife`;
USE `fitlife`;

DROP TABLE IF EXISTS `stores`;
CREATE TABLE `stores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `store-id` VARCHAR(20) NOT NULL,
  `store` VARCHAR(20) NOT NULL,
  `delivery-days` VARCHAR(50) NOT NULL,
  `db-id` INT,
  `state` VARCHAR(20) NOT NULL,
  PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS `zipcode`;
CREATE TABLE `zipcode` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `zipcode` VARCHAR(20) NOT NULL,
  `store-id` VARCHAR(20) NOT NULL,
  PRIMARY KEY(`id`)
);
