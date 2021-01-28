const { restApiRequestWithHeader } = require("../../util/restApiRequest");

const { RECHARGE_ACCESS_TOKEN } = process.env;

module.exports.getRechargeRequest = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const options = {
        url: url,
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
