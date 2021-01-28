const pool = require("../database/connection");

module.exports.getAllUntaggedOrderErrors = async () => {
  try {
    const promisePool = pool.promise();
    const query =
      "SELECT * FROM `error_order_logs` WHERE `notes`='Order Probably Not Tagged' AND `has_been_resolved` IS NULL";
    const [orderRows] = await promisePool.query(query);
    return orderRows;
  } catch (error) {
    throw error;
  }
};

module.exports.markOrderErrorAsResolved = async (id) => {
  try {
    const promisePool = pool.promise();
    const query =
      "UPDATE `error_order_logs` SET `has_been_resolved`=true WHERE `id`=?";
    const [updatedRow] = await promisePool.query(query, [id]);
    return updatedRow;
  } catch (error) {
    throw error;
  }
};

