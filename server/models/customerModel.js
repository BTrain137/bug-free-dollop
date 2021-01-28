const pool = require("../database/connection");

module.exports.getAllUpdatedCustomer = async () => {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `has_been_updated` = ?";
    const [rows] = await promisePool.query(selectQuery, [true]);
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports.getAllCustomer = async () => {
  try {
    const promisePool = pool.promise();
    const selectQuery = "SELECT * FROM `customer_log`";
    const [rows] = await promisePool.query(selectQuery);
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports.getCustomerByEmail = async (email) => {
  try {
    const promisePool = pool.promise();
    const selectQuery = "SELECT * FROM `customer_log` WHERE customer_email=?";
    const [rows] = await promisePool.query(selectQuery, [email]);
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports.getCustomersWithWeeklyDeliveries = async () => {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `weekly_deliveries` IS NOT NULL";
    const [rows] = await promisePool.query(selectQuery);
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports.getCustomersWithWeeklyDeliveriesForComingWednesday = async (
  nextChargeDate
) => {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `weekly_deliveries` LIKE ? AND has_been_updated != 1";
    const [rows] = await promisePool.query(selectQuery, [
      `%"${nextChargeDate}":[%`,
    ]);
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports.addRechargeIdToCustomer = async (email, id) => {
  try {
    const promisePool = pool.promise();
    const updateQuery =
      "UPDATE `customer_log` SET `customer_id`=? WHERE `customer_email`=?";
    const updateResult = await promisePool.query(updateQuery, [id, email]);
    return "okay";
  } catch (error) {
    throw error;
  }
};

module.exports.customerLogReset = async (customer_email) => {
  try {
    const promisePool = pool.promise();
    // TODO: Exist query
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `customer_email` = ? ";
    const [customerRow] = await promisePool.query(selectQuery, [
      customer_email,
    ]);
    if (customerRow.length) {
      const updateQuery =
        "UPDATE `customer_log` SET `has_been_updated` = ?, `has_changed_meal_plan` = ? WHERE `customer_email` = ? ";
      const updateResult = await promisePool.query(updateQuery, [
        null,
        null,
        customer_email,
        ,
      ]);
    }
    return "okay";
  } catch (error) {
    throw error;
  }
};

/*
 *
 * @params {{ customer_id:Number, has_changed_meal_plan:BOOLEAN }} customerData  Store the customer so it doesn't have to be looped again
 * @return {Promise<{STRING}>}
 */

module.exports.logCustomer = async (customerData) => {
  try {
    const promisePool = pool.promise();
    const selectQuery = "SELECT * FROM `customer_log` WHERE `customer_id` = ? ";
    const [customerRow] = await promisePool.query(selectQuery, [
      customerData.customer_id,
    ]);

    if (customerRow.length) {
      const hasCustomerChangeMeals =
        customerData.has_changed_meal_plan ||
        customerRow[0].has_changed_meal_plan;
      const customerId = customerData.customer_id;
      const insertQuery =
        "UPDATE `customer_log` SET `has_changed_meal_plan` = ?, `has_been_updated` = ? WHERE `customer_id` = ?";
      const [insertRows] = await promisePool.query(insertQuery, [
        hasCustomerChangeMeals,
        true,
        customerId,
      ]);
      console.log(insertRows);
    } else {
      customerData.has_been_updated = true;
      const insertQuery = "INSERT INTO `customer_log` SET ?";
      const [insertRows] = await promisePool.query(insertQuery, customerData);
      console.log(insertRows);
    }
    return "ok";
  } catch (error) {
    throw error;
  }
};

module.exports.getWeeklyDeliveryDayData = async function (
  customerEmail,
  customerId
) {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `customer_email` = ? ";
    const [customerRow] = await promisePool.query(selectQuery, [customerEmail]);
    if (customerRow.length) {
      const weeklyDeliveryDay = customerRow[0].weekly_delivery_day
        ? JSON.parse(customerRow[0].weekly_delivery_day)
        : {};
      return weeklyDeliveryDay;
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

/**
 * @description Create a new object or update the existing object
 * @param {{ Date:Number: Day:String }} newField   Value to be access later
 * @param {Number|String}               customerId Valid customer ID associated with recharge
 */

module.exports.createOrUpdateDayData = async function (
  newField,
  customerEmail,
  customerId
) {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `customer_email` = ? ";
    const [customerRow] = await promisePool.query(selectQuery, [customerEmail]);

    if (customerRow.length) {
      const date = Object.keys(newField)[0];
      let dayData = {};
      if (customerRow[0].weekly_delivery_day) {
        dayData = JSON.parse(customerRow[0].weekly_delivery_day);
      }
      dayData[date] = newField[date];
      const updateQuery =
        "UPDATE `customer_log` SET `weekly_delivery_day` = ? WHERE `customer_email` = ?";
      const [customerRowUpdate] = await promisePool.query(updateQuery, [
        JSON.stringify(dayData),
        customerEmail,
      ]);
      return dayData;
    } else {
      const insertObj = {
        customer_id: customerId || null,
        customer_email: customerEmail,
        weekly_delivery_day: JSON.stringify(newField),
        has_been_updated: true,
      };
      const insertQuery = "INSERT INTO `customer_log` SET ?";
      const [customerRowInsert] = await promisePool.query(
        insertQuery,
        insertObj
      );
      return newField;
    }
  } catch (error) {
    throw error;
  }
};

// Passing in an empty string can clear out the field
module.exports.createOrReplaceDayData = async function (
  newField,
  customerEmail,
  customerId
) {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `customer_email` = ? ";
    const [customerRow] = await promisePool.query(selectQuery, [customerEmail]);

    if (customerRow.length) {
      const dayData = newField ? JSON.stringify(newField) : null;
      const updateQuery =
        "UPDATE `customer_log` SET `weekly_delivery_day` = ? WHERE `customer_email` = ?";
      const [customerRowUpdate] = await promisePool.query(updateQuery, [
        dayData,
        customerEmail,
      ]);
      return dayData;
    } else {
      const insertObj = {
        customer_id: customerId || null,
        customer_email: customerEmail,
        weekly_delivery_day: JSON.stringify(newField),
        has_been_updated: true,
      };
      const insertQuery = "INSERT INTO `customer_log` SET ?";
      const [customerRowInsert] = await promisePool.query(
        insertQuery,
        insertObj
      );
      return newField;
    }
  } catch (error) {
    throw error;
  }
};

module.exports.getDeliveriesData = async function (customerEmail, customerId) {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `customer_email` = ? ";
    const [customerRow] = await promisePool.query(selectQuery, [customerEmail]);
    if (customerRow.length) {
      const deliveriesData = customerRow[0].weekly_deliveries
        ? JSON.parse(customerRow[0].weekly_deliveries)
        : {};
      return deliveriesData;
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

module.exports.createOrReplaceDeliveriesData = async function (
  newField,
  customerEmail,
  customerId
) {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `customer_email` = ? ";
    const [customerRow] = await promisePool.query(selectQuery, [customerEmail]);

    if (customerRow.length) {
      const deliveriesData = newField ? JSON.stringify(newField) : null;
      const hasBeenUpdated = deliveriesData ? true : null;
      const updateQuery =
        "UPDATE `customer_log` SET `weekly_deliveries` = ?, `has_been_updated` = ? WHERE `customer_email` = ?";
      const [customerRowUpdate] = await promisePool.query(updateQuery, [
        deliveriesData,
        hasBeenUpdated,
        customerEmail,
      ]);
      return deliveriesData;
    } else {
      const insertObj = {
        customer_id: customerId || null,
        customer_email: customerEmail,
        weekly_deliveries: JSON.stringify(newField),
        has_been_updated: true,
      };
      const insertQuery = "INSERT INTO `customer_log` SET ?";
      const [customerRowInsert] = await promisePool.query(
        insertQuery,
        insertObj
      );
      return newField;
    }
  } catch (error) {
    throw error;
  }
};

module.exports.updateDeliveriesBulk = async function (
  newField,
  customerEmail,
  customerId
) {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `customer_email` = ? ";
    const [customerRow] = await promisePool.query(selectQuery, [customerEmail]);

    if (customerRow.length) {
      const deliveriesData = newField ? JSON.stringify(newField) : null;
      const hasBeenUpdated = deliveriesData ? true : null;
      const updateQuery =
        "UPDATE `customer_log` SET `weekly_deliveries_bulk` = ?, `has_been_updated` = ? WHERE `customer_email` = ?";
      const [customerRowUpdate] = await promisePool.query(updateQuery, [
        deliveriesData,
        hasBeenUpdated,
        customerEmail,
      ]);
      return deliveriesData;
    } else {
      const insertObj = {
        customer_id: customerId || null,
        customer_email: customerEmail,
        weekly_deliveries_bulk: JSON.stringify(newField),
        has_been_updated: true,
      };
      const insertQuery = "INSERT INTO `customer_log` SET ?";
      const [customerRowInsert] = await promisePool.query(
        insertQuery,
        insertObj
      );
      return newField;
    }
  } catch (error) {
    throw error;
  }
};

module.exports.createOrUpdateDeliveriesData = async function (
  newField,
  customerEmail,
  customerId
) {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `customer_email` = ? ";
    const [customerRow] = await promisePool.query(selectQuery, [customerEmail]);

    if (customerRow.length) {
      const date = Object.keys(newField)[0];
      let deliveriesData = {};
      if (customerRow[0].weekly_deliveries) {
        deliveriesData = JSON.parse(customerRow[0].weekly_deliveries);
      }
      deliveriesData[date] = newField[date];
      const updateQuery =
        "UPDATE `customer_log` SET `weekly_deliveries` = ?, `has_been_updated` = ? WHERE `customer_email` = ?";
      const [customerRowUpdate] = await promisePool.query(updateQuery, [
        JSON.stringify(deliveriesData),
        true,
        customerEmail,
      ]);
      return deliveriesData;
    } else {
      const insertObj = {
        customer_id: customerId || null,
        customer_email: customerEmail,
        weekly_deliveries: JSON.stringify(newField),
        has_been_updated: true,
      };
      const insertQuery = "INSERT INTO `customer_log` SET ?";
      const [customerRowInsert] = await promisePool.query(
        insertQuery,
        insertObj
      );
      return newField;
    }
  } catch (error) {
    throw error;
  }
};

module.exports.replaceVariantIdForDeliveries = async (
  customer_email,
  weekly_deliveries,
  weekly_deliveries_bulk
) => {
  try {
    const promisePool = pool.promise();
    const updateQuery =
      "UPDATE `customer_log` SET `weekly_deliveries` = ?, `weekly_deliveries_bulk` = ?  WHERE `customer_email` = ?";
    const [customerRowUpdate] = await promisePool.query(updateQuery, [
      weekly_deliveries,
      weekly_deliveries_bulk,
      customer_email,
    ]);
    return customerRowUpdate;
  } catch (error) {
    throw error;
  }
};

module.exports.resetAllCustomerFields = async function (
  customerEmail,
  customerId
) {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `customer_email` = ? ";
    const [customerRow] = await promisePool.query(selectQuery, [customerEmail]);

    if (customerRow.length) {
      const resetObj = {
        has_changed_meal_plan: null,
        has_been_updated: null,
        subscription_meal_plan: null,
        weekly_delivery_day: null,
        weekly_deliveries: null,
      };
      const updateQuery =
        "UPDATE `customer_log` SET ? WHERE `customer_email` = ?";
      const [customerRowUpdate] = await promisePool.query(updateQuery, [
        resetObj,
        customerEmail,
      ]);
      return {};
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

module.exports.resetFieldForCanceledCustomer = async function (
  customerEmail,
  customerId
) {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `customer_email` = ? ";
    const [customerRow] = await promisePool.query(selectQuery, [customerEmail]);

    if (customerRow.length) {
      const resetObj = {
        has_changed_meal_plan: null,
        has_been_updated: null,
        subscription_meal_plan: null,
        weekly_delivery_day: null,
        weekly_deliveries: null,
        weekly_deliveries_bulk: null,
        status: "INACTIVE",
      };
      const updateQuery =
        "UPDATE `customer_log` SET ? WHERE `customer_email` = ?";
      const [customerRowUpdate] = await promisePool.query(updateQuery, [
        resetObj,
        customerEmail,
      ]);
    } else {
      const insertObj = {
        customer_id: customerId || null,
        customer_email: customerEmail,
        status: "INACTIVE",
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
