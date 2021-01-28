const pool = require("../database/connection");

module.exports.getMealPlanData = async function (customerEmail, customerId) {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `customer_email` = ? ";
    const [customerRow] = await promisePool.query(selectQuery, [customerEmail]);

    if (customerRow.length) {
      const mealPlanData = customerRow[0].subscription_meal_plan
        ? JSON.parse(customerRow[0].subscription_meal_plan)
        : {};
      return mealPlanData;
    } else {
      const insertObj = {
        customer_id: customerId || null,
        customer_email: customerEmail,
      };
      const insertQuery = "INSERT INTO `customer_log` SET ?";
      const [customerRowInsert] = await promisePool.query(
        insertQuery,
        insertObj
      );
      return {};
    }
  } catch (error) {
    throw error;
  }
};

module.exports.resetMealPlanData = async function (customer_email) {
  try {
    const promisePool = pool.promise();
    const updateQuery =
      "UPDATE `customer_log` SET `subscription_meal_plan` = ?, `weekly_deliveries_bulk` = ?, `has_been_updated` = ?, `has_changed_meal_plan` = ? WHERE `customer_email` = ?";
    const [customerRowUpdate] = await promisePool.query(updateQuery, [
      null,
      null,
      null,
      null,
      customer_email,
    ]);
    return "okay";
  } catch (error) {
    throw error;
  }
};

module.exports.createOrReplaceMealPlanData = async function (
  mealPlanData,
  customerEmail,
  customerId
) {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `customer_email` = ? ";
    const [customerRow] = await promisePool.query(selectQuery, [customerEmail]);

    if (customerRow.length) {
      const updateQuery =
        "UPDATE `customer_log` SET `subscription_meal_plan` = ?, `has_been_updated` = ?, `has_changed_meal_plan` = ? WHERE `customer_email` = ?";
      const [customerRowUpdate] = await promisePool.query(updateQuery, [
        JSON.stringify(mealPlanData),
        true,
        true,
        customerEmail,
      ]);
      return mealPlanData;
    } else {
      const insertObj = {
        customer_id: customerId || null,
        customer_email: customerEmail,
        subscription_meal_plan: JSON.stringify(mealPlanData),
        has_been_updated: true,
        has_changed_meal_plan: true,
      };
      const insertQuery = "INSERT INTO `customer_log` SET ?";
      const [customerRowInsert] = await promisePool.query(
        insertQuery,
        insertObj
      );
      return mealPlanData;
    }
  } catch (error) {
    throw error;
  }
};

module.exports.removeFromQueue = async (customerEmail) => {
  try {
    const promisePool = pool.promise();
    const updateQuery =
      "UPDATE `customer_log` SET `has_changed_meal_plan` = ?, `has_been_updated` = ? WHERE `customer_email` = ?";
    const [customerRowUpdate] = await promisePool.query(updateQuery, [
      0,
      0,
      customerEmail,
    ]);
    return "okay";
  } catch (error) {
    throw error;
  }
};
