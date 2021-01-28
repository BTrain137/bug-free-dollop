const { markOrderErrorAsResolved } = require("../models/orderModel");
const { getRechargeOrder } = require("../models/recharge/orders");
const { processRecurringOrder } = require("./processOrders");

module.exports.processUntaggedOrders = async (orders) => {
  try {
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const { json_data, id } = order;
      const data = JSON.parse(json_data);
      const { recharge_order_id } = data;
      if (recharge_order_id) {
        const order = await getRechargeOrder(recharge_order_id);
        await processRecurringOrder(order);
        await markOrderErrorAsResolved(id);
      }
    }
    console.log("Completed processUntaggedOrders");
    return "ok";
  } catch (error) {
    throw error;
  }
};
