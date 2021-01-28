const Recharge = require("recharge-api-node");

const { RECHARGE_API_KEY, RECHARGE_SECRETE } = process.env;

const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_SECRETE,
});

module.exports.getAddressDetailById = (addressId) => {
  return new Promise((resolve, reject) => {
    recharge.address
      .get(addressId)
      .then((address) => resolve(address))
      .catch((error) => reject(error));
  });
};

module.exports.getAddressByCustomerId = (customerId) => {
  return new Promise((resolve, reject) => {
    recharge.customerAddress
      .list(customerId)
      .then((address) => resolve(address))
      .catch((error) => reject(error));
  });
};
