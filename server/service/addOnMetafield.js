const {
  getAddOnMetafield,
  createAddOnMetafield,
  updateAddOnMetaField,
} = require("../util/rechargeAddOnMetafield.js");

/**
 * @description Create Addon Recharge Metafields if doesn't exit
 * @param {{ variantId:String, quantity:Number, weight:Number, }} newField   Value to be access later
 * @param {Number|String}                                         customerId Valid customer ID associated with recharge
 */

module.exports.createOrUpdateAddonMetafield = (newField, customerId) => {
  return new Promise(async (resolve, reject) => {
    let result;
    try {
      const addOnMetafield = await getAddOnMetafield(customerId);

      if (addOnMetafield && addOnMetafield.hasOwnProperty("value")) {
        result = await updateAddOnMetaField(
          addOnMetafield.id,
          newField,
          customerId
        );
      } else {
        result = await createAddOnMetafield(newField, customerId);
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
