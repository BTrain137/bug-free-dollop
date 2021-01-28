const { replaceVariantIdForDeliveries } = require("../models/customerModel");

module.exports.replaceWeeklyMealsVariantSku = async (
  customers,
  originalItem,
  newItem
) => {
  for (let i = 0; i < customers.length; i++) {
    try {
      const customer = customers[i];
      const {
        customer_email,
        weekly_deliveries,
        weekly_deliveries_bulk,
      } = customer;
      let updateWeeklyDeliveries;
      let updateWeeklyDeliveriesBulk;

      const originalVariantIdReg = new RegExp(originalItem.variantId, "g");
      const originalProductIdReg = new RegExp(originalItem.productId, "g");

      if (
        weekly_deliveries &&
        weekly_deliveries.includes(originalItem.variantId)
      ) {
        updateWeeklyDeliveries = weekly_deliveries
          .replace(originalVariantIdReg, newItem.variantId)
          .replace(originalProductIdReg, newItem.productId);
      }

      if (
        weekly_deliveries_bulk &&
        weekly_deliveries_bulk.includes(originalItem.variantId)
      ) {
        updateWeeklyDeliveriesBulk = weekly_deliveries_bulk
          .replace(originalVariantIdReg, newItem.variantId)
          .replace(originalProductIdReg, newItem.productId);
      }

      if (updateWeeklyDeliveries || updateWeeklyDeliveriesBulk) {
        console.log(JSON.parse(updateWeeklyDeliveries));
        await replaceVariantIdForDeliveries(
          customer_email,
          updateWeeklyDeliveries,
          updateWeeklyDeliveriesBulk
        );
      }
    } catch (error) {
      console.log("replaceWeeklyMealsVariantSku", error);
    }
  }
  return "completed";
};
