const pool = require("../database/connection");

module.exports.getAddonData = async function (customerEmail, customerId) {
  try {
    const promisePool = pool.promise();
    const selectQuery =
      "SELECT * FROM `customer_log` WHERE `customer_email` = ? ";
    const [customerRow] = await promisePool.query(selectQuery, [customerEmail]);

    if (customerRow.length) {
      const addonData = customerRow[0].add_on_products
        ? JSON.parse(customerRow[0].add_on_products)
        : {};
      return addonData;
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

module.exports.resetAddOnData = async function (customer_email) {
  try {
    const promisePool = pool.promise();
    const updateQuery =
      "UPDATE `customer_log` SET `add_on_products` = ? WHERE `customer_email` = ?";
    const [customerRowUpdate] = await promisePool.query(updateQuery, [
      null,
      customer_email,
    ]);
    return "okay";
  } catch (error) {
    throw error;
  }
};

module.exports.createOrReplaceAddonData = async function (
  addOnProducts,
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
        "UPDATE `customer_log` SET `add_on_products` = ?, `has_been_updated` = ? WHERE `customer_email` = ?";
      const [customerRowUpdate] = await promisePool.query(updateQuery, [
        JSON.stringify(addOnProducts),
        true,
        customerEmail,
      ]);
      return addOnProducts;
    } else {
      const insertObj = {
        customer_id: customerId || null,
        customer_email: customerEmail,
        add_on_products: JSON.stringify(addOnProducts),
        has_been_updated: true,
      };
      const insertQuery = "INSERT INTO `customer_log` SET ?";
      const [customerRowInsert] = await promisePool.query(
        insertQuery,
        insertObj
      );
      return addOnProducts;
    }
  } catch (error) {
    throw error;
  }
};
