const apiPostRequest = require("../util/apiPostRequest.js");
const { SHOP, ACCESS_TOKEN } = process.env;
/**
 * Using rest to redirect. No graphql option available
 *
 * @param  {String|Number} id Id of the order
 * @return Void
 */

const getOrderThankUrl = function (id) {
  return new Promise(async function (resolve, reject) {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/2020-07/orders/${id}.json`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
        },
      };

      const result = await apiPostRequest(options);
      const {
        order: { order_status_url },
      } = JSON.parse(result);

      resolve(order_status_url);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = getOrderThankUrl;
