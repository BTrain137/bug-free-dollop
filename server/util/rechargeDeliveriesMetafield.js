const {
  getMetafield,
  updateMetaField,
  createMetafield,
} = require("./rechargeHelpers");

/**
 * @description Retrieve order metafield
 * @param {Number|String} customerId Valid customer ID associated with recharge
 */

module.exports.getDeliveriesMetafield = (customerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await getMetafield("weeklyDeliveries", customerId);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @description Update Recharge Delivery Metafields
 * @param {Number}        metafieldId   Metafield Id to update the same metafield
 * @param {Object|String} updatedFields Value to be access later
 * @param {Number|String} customerId    Valid customer ID associated with recharge
 */

module.exports.updateDeliveriesMetaField = (
  metafieldId,
  updatedFields,
  customerId
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await updateMetaField(
        metafieldId,
        customerId,
        updatedFields,
        "string",
        "Weekly Deliveries, Object of meals or string skipped"
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

module.exports.createDeliveriesMetafield = (newField, customerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await createMetafield(
        "Weekly Deliveries, Object of meals or string skipped",
        newField,
        "string",
        "weeklyDeliveries",
        customerId,
      );
      // TODO: Return the metafield;
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
