
SELECT * FROM `zipcode` WHERE `zipcode`.`zipcode` = '30126';

SELECT * FROM `zipcode` WHERE `zipcode`.`store-id` = '1001';

SELECT * FROM `stores` WHERE `stores`.`store-id` = '1001';

SELECT *
FROM `stores` INNER JOIN `zipcode` ON `zipcode`.`store-id` = `stores`.`store-id`
WHERE `zipcode`.`zipcode`= '30126';


SELECT `zipcode`.`store-id`, `zipcode`.`zipcode`, `stores`.`store`, `stores`.`delivery-days`, `stores`.`db-id`, `stores`.`state`
FROM `stores` INNER JOIN `zipcode` ON `zipcode`.`store-id` = `stores`.`store-id`
WHERE `zipcode`.`zipcode`= '30126';
