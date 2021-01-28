const Recharge = require("recharge-api-node");
const { restApiRequest } = require("../../util/restApiRequest");

const {
  RECHARGE_API_KEY,
  RECHARGE_SECRETE,
  RECHARGE_ACCESS_TOKEN,
} = process.env;

const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_SECRETE,
});

module.exports.getMealSubscriptionIds = (customerId) => {
  return new Promise((resolve, reject) => {
    try {
      recharge.subscription
        .list({
          customer_id: customerId,
          // status: "ACTIVE",
        })
        .then((subscriptions) => {
          const mealPlanAndMeal = subscriptions.filter((subscription) => {
            const { price, product_title } = subscription;
            return price == 0 || product_title.includes(" Meals: ");
          });
          const mealSubscriptionIds = mealPlanAndMeal.map((subscription) => {
            return {
              id: subscription.id,
            };
          });

          // TODO: get meal
          resolve({
            mealSubscriptionIds,
            addressId: mealPlanAndMeal[0] ? mealPlanAndMeal[0].address_id : "",
          });
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports.bulkDeleteSubscription = (mealSubscriptionIds, addressId) => {
  return new Promise(async (resolve, reject) => {
    if (!mealSubscriptionIds || !mealSubscriptionIds.length) {
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

module.exports.createSubscriptionBulk = (processedSubscriptions, addressId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const bulkCreateSubscriptions = {
        subscriptions: processedSubscriptions,
      };

      const options = {
        url: `https://api.rechargeapps.com/addresses/${addressId}/subscriptions-bulk`,
        headers: {
          "X-Recharge-Access-Token": RECHARGE_ACCESS_TOKEN,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "POST",
        body: bulkCreateSubscriptions,
      };

      const results = await restApiRequest(options);
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports.getActiveSubscriptionByCustomerId = (customerId) => {
  return new Promise((resolve, reject) => {
    recharge.subscription
      .list({
        customer_id: customerId,
        status: "ACTIVE",
      })
      .then((success) => resolve(success))
      .catch((error) => reject(error));
  });
};
