const { restApiRequest } = require("../util/restApiRequest");

const { RECHARGE_ACCESS_TOKEN } = process.env;

/***
 * @param {Object} processedSubscriptions
 * @param {Number} addressId
 */
module.exports.createSubscriptionsBulk = async (processedSubscriptions, addressId) => {
  try {
    const options = {
      url: `https://api.rechargeapps.com/addresses/${addressId}/subscriptions-bulk`,
      headers: {
        "X-Recharge-Access-Token": RECHARGE_ACCESS_TOKEN,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
      body: {
        subscriptions: processedSubscriptions,
      },
    };

    const results = await restApiRequest(options);
    return results;
  } catch (error) {
    throw error;
  }
};

/***
 * @param {Object} processedSubscriptions
 * @param {Number} addressId
 */

 /**
  * 
  [
    {
      "id": 64993717,
      "price": 23.00,
      "quantity": 3
    },
    {
      "id": 64993718,
      "price": 24.00,
      "quantity": 4
    },
    {
      "id": 64993719,
      "price": 25.00,
      "quantity": 5
    }
  ]
  */

module.exports.updateSubscriptionsBulk = async (processedSubscriptions, addressId) => {
  try {
    const options = {
      url: `https://api.rechargeapps.com/addresses/${addressId}/subscriptions-bulk`,
      headers: {
        "X-Recharge-Access-Token": RECHARGE_ACCESS_TOKEN,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "PUT",
      body: {
        subscriptions: processedSubscriptions,
      },
    };

    const results = await restApiRequest(options);
    return results;
  } catch (error) {
    throw error;
  }
};

module.exports.getAllSubscriptions = async (rechargeCustomerId) => {
  try {
    const options = {
      url: `https://api.rechargeapps.com/subscriptions?customer_id=${rechargeCustomerId}`,
      headers: {
        "X-Recharge-Access-Token": RECHARGE_ACCESS_TOKEN,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "GET",
    };

    const results = await restApiRequest(options);
    return results;
  } catch (error) {
    throw error;
  }
};

/**
 * 
  [
    {
      "id": 64993717,
      "send_email":0
    },
    {
      "id": 64993718,
      "send_email":0
    },
    {
      "id": 64993719,
      "send_email":0
    }
  ]
 */

module.exports.deleteSubscriptionBulk = (mealSubscriptionIds, addressId) => {
  return new Promise(async (resolve, reject) => {
    if (!mealSubscriptionIds.length) {
      return resolve();
    }
    try {
      const bulkDeleteData = {
        subscriptions: mealSubscriptionIds,
      };

      const options = {
        url: `https://api.rechargeapps.com/addresses/${addressId}/subscriptions-bulk`,
        headers: {
          "X-Recharge-Access-Token": RECHARGE_ACCESS_TOKEN,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "DELETE",
        body: bulkDeleteData,
      };

      const results = await restApiRequest(options);
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};
