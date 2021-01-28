const Recharge = require("recharge-api-node");
const {restApiRequest} = require("../../util/restApiRequest");

const {
  RECHARGE_API_KEY,
  RECHARGE_SECRETE,
  RECHARGE_ACCESS_TOKEN,
} = process.env;

const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_SECRETE,
});

module.exports.findCustomerByEmail = (email) => {
  return new Promise((resolve, reject) => {
    recharge.customer
      .list({
        email,
      })
      .then((customers) => {
        return resolve(customers);
      })
      .catch((error) => {
        return reject(error);
      });
  });
};

module.exports.getAllActiveCustomer = (page = 1, limit = 50) => {
  return new Promise(async (resolve, reject) => {
    try {
      const options = {
        url: `https://api.rechargeapps.com/customers?status=ACTIVE&limit=${limit}&page=${page}`,
        headers: {
          "X-Recharge-Access-Token": RECHARGE_ACCESS_TOKEN,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "GET",
      };

      const results = await restApiRequest(options);
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};
