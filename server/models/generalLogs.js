const pool = require("../database/connection");

/**
 * Error Object that needs to be inserted
 * @typedef {{
 *   customer_id: Number,
 *   customer_email: String,
 *   action: String,
 *   route: String,
 *   function_name: String,
 *   notes: String,
 *   json_data: String,
 * }} errorObj
 */

/**
 *
 * @param {errorObj} dataObj
 */

module.exports.generalLog = async (dataObj) => {
  try {
    const promisePool = pool.promise();
    const query = "INSERT INTO `general_logs` SET ?";
    const data = {
      customer_id: dataObj.customer_id || null,
      customer_email: dataObj.customer_email || null,
      action: dataObj.action || null,
      route: dataObj.route || null,
      function_name: dataObj.function_name || null,
      notes: dataObj.notes || null,
      json_data: dataObj.json_data ? JSON.stringify(dataObj.json_data) : null,
    };
    const [generalLog] = await promisePool.query(query, data);
    return generalLog;
  } catch (error) {
    console.log("ERROR: generalLog not logged");
    return false;
  }
};
