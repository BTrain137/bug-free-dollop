const pool = require("../database/connection");

/*
 * 
 * @params {String|Number} zipCode   Zipcode attached to the store
 * @return {Promise<{zipcode:String, "delivery-days":String[], "store":String, "db-id":Number, "state":String}>}
 */

module.exports.findStoreByZipCode = async (zipCode) => {
  try {
    const promisePool = pool.promise();
    let query =
      "SELECT `zipcode`.`store-id`, `zipcode`.`zipcode`, `stores`.`store`, `stores`.`delivery-days`, `stores`.`db-id`, `stores`.`state` ";
    query +=
      "FROM `stores` INNER JOIN `zipcode` ON `zipcode`.`store-id` = `stores`.`store-id` ";
    query += "WHERE `zipcode`.`zipcode`= ?;";

    const [rows] = await promisePool.query(query, [zipCode]);
    if(!rows.length) {
      return false;
    }
    const storeObj = {
      zipcode: rows[0]["zipcode"],
      "delivery-days": JSON.parse(rows[0]["delivery-days"]),
      store: rows[0].store,
      "db-id": rows[0]["db-id"],
      state: rows[0].state,
      "store-id": rows[0]["store-id"],
    };
    return storeObj;
  } catch (error) {
    throw error;
  }
};

module.exports.getAllStores = async () => {
  try {
    const promisePool = pool.promise();
    let query = "SELECT * FROM `stores`";
    const [rows, fields] = await promisePool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports.getAllZipcode = async () => {
  try {
    const promisePool = pool.promise();
    let query = "SELECT * FROM `zipcode`";
    const [rows, fields] = await promisePool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports.addZipCode = async (zipCode, storeId) => {
  try {
    const promisePool = pool.promise();
    let query = "INSERT INTO ";
    const [rows, fields] = await promisePool.query(query, [zipCode, storeId]);
    return rows;
  } catch (error) {
    throw error;
  }
};
