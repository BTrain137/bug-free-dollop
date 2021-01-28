const Recharge = require("recharge-api-node");

const { RECHARGE_API_KEY, RECHARGE_SECRETE } = process.env;

const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_SECRETE,
});

module.exports.getRechargeOrder = (orderNumber) => {
  return new Promise((resolve, reject) => {
    recharge.order
      .get(orderNumber)
      .then((order) => resolve(order))
      .catch((error) => reject(error));
  });
};

module.exports.getGetRechargeOrderByShopifyId = (shopifyOrderId) => {
  return new Promise((resolve, reject) => {
    recharge.order
      .list({ shopify_order_id: shopifyOrderId })
      .then((order) => resolve(order))
      .catch((error) => reject(error));
  });
};
