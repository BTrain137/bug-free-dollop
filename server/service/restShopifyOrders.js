const { restApiRequest } = require("../util/restApiRequest");

const { SHOP, SHOPIFY_ACCESS_TOKEN } = process.env;

const getOrdersByIdShopify = function (orderId) {
  return new Promise(async function (resolve, reject) {
    try {
      const params = {
        url: `https://${SHOP}.myshopify.com/admin/api/2020-07/orders/${orderId}.json`,
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        method: "GET",
        json: true,
      };
      const { order } = await restApiRequest(params);
      resolve(order);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = getOrdersByIdShopify;
