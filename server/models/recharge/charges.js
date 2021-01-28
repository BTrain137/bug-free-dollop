const Recharge = require("recharge-api-node");
const { restApiRequestWithHeader } = require("../../util/restApiRequest");

const {
  RECHARGE_API_KEY,
  RECHARGE_SECRETE,
  RECHARGE_ACCESS_TOKEN,
} = process.env;

const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_SECRETE,
});

module.exports.getSkippedCharges = (customer_id, date) => {
  // customer_id=51599077&date=2020-11-04&status=SKIPPED
  return new Promise((resolve, reject) => {
    recharge.charge
      .list({
        customer_id,
        date,
        status: "SKIPPED",
      })
      .then((charges) => {
        resolve(charges);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports.getAllChargesOnDate = (date, limit = 50) => {
  return new Promise(async (resolve, reject) => {
    try {
      const options = {
        url: `https://api.rechargeapps.com/charges?date=${date}&status=QUEUED&limit=${limit}`,
        headers: {
          "X-Recharge-Access-Token": RECHARGE_ACCESS_TOKEN,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "GET",
      };

      const results = await restApiRequestWithHeader(options);
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};
