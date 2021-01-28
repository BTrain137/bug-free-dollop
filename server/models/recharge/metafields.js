const Recharge = require("recharge-api-node");

const { RECHARGE_API_KEY, RECHARGE_SECRETE, NAMESPACE_ID } = process.env;

const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_SECRETE,
});

module.exports.getAllCustomerMetafield = (customerId) => {
  return new Promise((resolve, reject) => {
    recharge.metafield
      .list({
        owner_resource: "customer",
        owner_id: customerId,
        namespace: NAMESPACE_ID,
      })
      .then((metafields) => resolve(metafields))
      .catch((error) => reject(error));
  });
};
