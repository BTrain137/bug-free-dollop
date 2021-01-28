const {
  getMetafield,
  updateMetaField,
  createMetafield,
} = require("./rechargeHelpers");

/**
 * @description Retrieve order metafield
 * @param {Number|String} customerId Valid customer ID associated with recharge
 */

module.exports.getDayMetafield = (customerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await getMetafield("weeklyDeliveryDay", customerId);
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

module.exports.updateDayMetaField = (
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
        "string",
        "Day of the week order is to be shipped"
      );
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @description Create Recharge Metafields
 * @param {Object|String} newField   Value to be access later
 * @param {Number|String} customerId Valid customer ID associated with recharge
 */

module.exports.createDayMetafield = (newField, customerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await createMetafield(
        "Day of the week order is to be shipped",
        JSON.stringify(newField),
        "string",
        "weeklyDeliveryDay",
        customerId,
      );
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
