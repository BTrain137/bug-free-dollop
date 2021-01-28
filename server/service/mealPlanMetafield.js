const {
  getMealPlanMetafield,
  createMealPlanMetafield,
  updateMealPlanMetaField,
} = require("../util/rechargeMealPlanMetafield.js");

/**
 * @description Create MealPlan Recharge Metafields if doesn't exit
 * @param {{ variantId:String, quantity:Number, weight:Number, }} newField   Value to be access later
 * @param {Number|String}                                         customerId Valid customer ID associated with recharge
 */

module.exports.createOrUpdateMealPlanMetafield = (newField, customerId) => {
  return new Promise(async (resolve, reject) => {
    let result;
    try {
      const mealPlanMetafield = await getMealPlanMetafield(customerId);

      if (mealPlanMetafield && mealPlanMetafield.hasOwnProperty("value")) {
        result = await updateMealPlanMetaField(
          mealPlanMetafield.id,
          newField,
          customerId
        );
      } else {
        result = await createMealPlanMetafield(newField, customerId);
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
