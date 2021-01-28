const axios = require("axios");
const { RECHARGE_API_KEY } = process.env;

module.exports.setNextChargeDateBulk = async (addressId, body) => {
  return new Promise((resolve, reject) => {
    var options = {
      headers: {
        "X-Recharge-Access-Token": RECHARGE_API_KEY,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    axios
      .put(
        `https://api.rechargeapps.com/addresses/${addressId}/subscriptions-bulk`,
        body,
        options
      )
      .then(function (response) {
        // console.log("Success", response);
        resolve(response);
      })
      .catch(function (error) {
        // console.log(error);
        if (error.response.data && error.response.data.errors) {
          if (
            error.response.data.errors[0] &&
            error.response.data.errors[0].errors
          ) {
            console.log("--", error.response.data.errors[0].errors[0], "--");
          } else if (error.response.data) {
            console.log("=", error.response.data, "=");
          }
        }
        reject(error);
      });
  });
};
