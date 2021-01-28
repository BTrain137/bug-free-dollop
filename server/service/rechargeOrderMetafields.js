const {
  getMetafield,
  updateMetaField,
  createMetafield,
} = require("../util/rechargeHelpers");

/**
 * @description Retrieve order metafield
 * @param {Number|String} customerId Valid customer ID associated with recharge
 */

module.exports.getOrdersMetafield = (customerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await getMetafield("orders", customerId);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @description Update Recharge Order Metafields
 * @param {Number}        metafieldId   Metafield Id to update the same metafield
 * @param {Object|String} updatedFields Value to be access later
 * @param {Number|String} customerId    Valid customer ID associated with recharge
 */

module.exports.updateOrdersMetaField = (
  metafieldId,
  updatedFields,
  customerId
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await updateMetaField(
        metafieldId,
        customerId,
        JSON.stringify(updatedFields),
        "json_string",
        "order stored"
      );
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @description Create Recharge Metafields
 * @param {String}        key        Key used to locate metafield
 * @param {Object|String} newField   Value to be access later
 * @param {Number|String} customerId Valid customer ID associated with recharge
 */

module.exports.createOrderMetafield = (newField, customerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await createMetafield(
        "order stored",
        JSON.stringify(newField),
        "json_string",
        "orders",
        customerId,
      );
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
