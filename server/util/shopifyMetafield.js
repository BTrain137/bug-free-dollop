const { restApiRequest } = require("./restApiRequest");
const { SHOP, ACCESS_TOKEN } = process.env;

module.exports.postOrderMetafields = function (metafield, orderId) {
  return new Promise(async function (resolve, reject) {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/2020-04/orders/${orderId}/metafields.json`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: metafield
      };

      const results = await restApiRequest(options);
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports.postCustomerMetafields = async (metafield, customerId) => {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/2020-04/customers/${customerId}/metafields.json`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: metafield
      };

      const results = await restApiRequest(options);
      return results;
    } catch (error) {
      throw error;
    }
};

module.exports.putCustomerMetafields = function (metafield, customerId, metafieldId) {
  return new Promise(async function (resolve, reject) {
    try {
      const options = {
        url: `https://${SHOP}.myshopify.com/admin/api/2020-04/customer/${customerId}/metafields/${metafieldId}.json`,
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: metafield
      };

      const results = await restApiRequest(options);
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};
