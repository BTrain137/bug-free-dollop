const {
  getMetafield,
  updateMetaField,
  createMetafield,
} = require("./rechargeHelpers");

/**
 * @description Retrieve metafield
 * @param {Number|String} customerId Valid customer ID associated with recharge
 */

module.exports.getMealPlanMetafield = (customerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await getMetafield("subscriptionMealPlan", customerId);
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

module.exports.updateMealPlanMetaField = (
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
        "Subscription Meal Plan"
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

module.exports.createMealPlanMetafield = (newField, customerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await createMetafield(
        "Subscription Meal Plan",
        JSON.stringify(newField),
        "string",
        "subscriptionMealPlan",
        customerId,
      );
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
