const Recharge = require("recharge-api-node");
const axios = require("axios");

const { restApiRequest } = require("../util/restApiRequest");
const getProductByTitle = require("../service/graphQLFindProductByTitle");
const cleanIDGraphql = require("../util/cleanIDGraphql");
const { addAddon, removeAddon } = require("./addOnController");
const {
  getAllSubscriptions,
  updateSubscriptionsBulk,
} = require("./subscriptionController");
const { logErrors } = require("../models/errorLogs");
const { generalLog } = require("../models/generalLogs");
const {
  getSkippedCharges,
  getAllChargesOnDate,
} = require("../models/recharge/charges");
const {
  resetMealPlanData,
  removeFromQueue,
} = require("../models/mealPlanModel");
const { resetAddOnData } = require("../models/addOnModel");
const {
  createOrReplaceDeliveriesData,
  getCustomersWithWeeklyDeliveries,
  resetFieldForCanceledCustomer,
} = require("../models/customerModel");
const {
  getLastWeekDayOccurrence,
  getNextChargeDate,
} = require("../util/dates");
const { removeSAndD } = require("./sAndDController");
const {
  getActiveSubscriptionByCustomerId,
} = require("../models/recharge/subscription");
const getThisWeekDayOccurrence = require("../util/getThisWeekDayOccurrence");
const getNextWeekDayOccurrence = require("../util/getNextWeekDayOccurrence");
const { findCustomerByEmail } = require("../models/recharge/customer");
const { cleanLinkHeader } = require("../util/cleanData");
const { getRechargeRequest } = require("../models/recharge/link");

const {
  RECHARGE_API_KEY,
  RECHARGE_SECRETE,
  RECHARGE_ACCESS_TOKEN,
} = process.env;

const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_SECRETE,
});

const processWeeklyDeliveries = (
  weekly_deliveries,
  mealPlanVariantId,
  weekly_deliveries_bulk
) => {
  return new Promise((resolve, reject) => {
    try {
      const weeklyDeliveries = JSON.parse(weekly_deliveries);
      const weeks = Object.keys(weeklyDeliveries);
      let nextChargeDate = weeks[0];

      // TODO: Next Charge date should be the week after `Delivery Date: ` But if `Delivery Date: ` is too old it should be next week. Then let the skip process

      let deliveryMeals;
      if (
        nextChargeDate &&
        weeklyDeliveries[nextChargeDate] === "skipped" &&
        weekly_deliveries_bulk
      ) {
        deliveryMeals = JSON.parse(weekly_deliveries_bulk);
      } else {
        deliveryMeals = weeklyDeliveries[nextChargeDate];
      }

      if (!deliveryMeals) {
        // TODO: May not need this.
        resolve([
          {
            charge_interval_frequency: "1",
            next_charge_scheduled_at: nextChargeDate,
            order_interval_frequency: "1",
            order_interval_unit: "week",
            quantity: 1,
            shopify_variant_id: mealPlanVariantId,
          },
        ]);
        return;
      }

      const subscriptions = deliveryMeals.map((subscription) => {
        let shopifyVariantId = "";
        let qty = "";
        for (const key in subscription) {
          if (subscription.hasOwnProperty(key)) {
            const element = subscription[key];
            if (key === "qty") {
              qty = element;
            } else {
              shopifyVariantId = element;
            }
          }
        }
        return {
          charge_interval_frequency: "1",
          next_charge_scheduled_at: nextChargeDate,
          order_interval_frequency: "1",
          order_interval_unit: "week",
          quantity: parseInt(qty, 10),
          shopify_variant_id: shopifyVariantId,
        };
      });

      subscriptions.push({
        charge_interval_frequency: "1",
        next_charge_scheduled_at: nextChargeDate,
        order_interval_frequency: "1",
        order_interval_unit: "week",
        quantity: 1,
        shopify_variant_id: mealPlanVariantId,
      });
      resolve(subscriptions);
    } catch (error) {
      reject(error);
    }
  });
};

const getMealSubscriptionIds = (customerId) => {
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
          const [mealPlan] = subscriptions.filter((subscription) => {
            const { product_title } = subscription;
            return product_title.includes(" Meals: ");
          });

          // TODO: get meal
          resolve({
            mealSubscriptionIds,
            addressId: mealPlanAndMeal[0] ? mealPlanAndMeal[0].address_id : "",
            mealPlan,
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

const bulkDeleteSubscription = (mealSubscriptionIds, addressId) => {
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

const getSubscriptionMealPlanId = (subscriptionMealPlan) => {
  return new Promise(async (resolve, reject) => {
    try {
      const mealPlanObj = JSON.parse(subscriptionMealPlan);
      const subscriptionTitle = `${mealPlanObj.mealCount} Meals: ${mealPlanObj.mealSize}`;
      const {
        products: { edges },
      } = await getProductByTitle(subscriptionTitle);

      const [shopifyProduct] = edges.filter(({ node }) =>
        node.title.includes(" Meals:")
      );
      const [variantId] = shopifyProduct.node.variants.edges.map(({ node }) =>
        cleanIDGraphql(node.id)
      );

      resolve(variantId);
    } catch (error) {
      reject(error);
    }
  });
};

const createSubscriptionBulk = (
  weekly_deliveries,
  mealPlanVariantId,
  addressId,
  weekly_deliveries_bulk
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const processedSubscriptions = await processWeeklyDeliveries(
        weekly_deliveries,
        mealPlanVariantId,
        weekly_deliveries_bulk
      );

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

      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

const getAllSubscriptionForCustomer = (customerId) => {
  return new Promise((resolve, reject) => {
    try {
      recharge.subscription
        .list({
          customer_id: customerId,
          status: "ACTIVE",
        })
        .then((subscriptions) => {
          resolve(subscriptions);
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

const getCustomerHash = (customerId) => {
  return new Promise((resolve, reject) => {
    try {
      recharge.customer
        .get(customerId)
        .then((customer) => {
          console.log(`=======================`);
          console.log(customer.email);
          console.log(customer.id);
          console.log(customer.shopify_customer_id);
          console.log(`=======================`);
          resolve(customer);
        })
        .catch((error) => reject(error));
    } catch (error) {
      reject(error);
    }
  });
};

const getRechargeCustomerByEmail = (email) => {
  return new Promise((resolve, reject) => {
    try {
      recharge.customer
        .list({
          email: email,
        })
        .then((customers) => {
          const customer = customers[0];
          console.log(`=======================`);
          // TODO: if customer is not found error is thrown
          console.log(customer.email);
          console.log(customer.id);
          console.log(customer.shopify_customer_id);
          console.log(`=======================`);
          resolve(customer);
        })
        .catch((error) => reject(error));
    } catch (error) {
      reject(error);
    }
  });
};

const unSkipOneSubscription = (
  customerHash,
  chargeId,
  date,
  subscriptionId
) => {
  // "/admin/customers/8335edc4512e7e4f/charges/294556557/unskip?date=2020-10-14&charge_id=294556557&item_ids[0]=107316575"
  // "/admin/customers/f72e0f920e6cecce/charges/300131569/unskip?date=2020-11-11&charge_id=300131569&item_ids[0]=109454107"

  return new Promise((resolve, reject) => {
    try {
      var options = {
        headers: {
          "X-Recharge-Access-Token": RECHARGE_ACCESS_TOKEN,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };

      axios
        .get(
          `https://fitlife-foods.shopifysubscriptions.com/customers/${customerHash}/charges/${chargeId}/unskip?date=${date}&charge_id=${chargeId}&item_ids[0]=${subscriptionId}`,
          options
        )
        .then(function (response) {
          // console.log(response);
          resolve(response);
        })
        .catch(function (error) {
          console.error(error);
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

const unSkipOneWeekDelivery = async (
  deliveryDate,
  hash,
  customerId,
  subscriptions
) => {
  try {
    const [charge] = await getSkippedCharges(customerId, deliveryDate);
    if (charge) {
      const { id: chargeId } = charge;
      if (!chargeId) {
        throw "error";
      }
      for (let i = 0; i < subscriptions.length; i++) {
        const subscription = subscriptions[i];
        await unSkipOneSubscription(
          hash,
          chargeId,
          deliveryDate,
          subscription.id
        );
      }
    } else {
      throw "error";
    }

    return "ok";
  } catch (error) {
    // log
    await logErrors({
      customer_id: hash,
      function_name: "unSkipOneWeekDelivery",
      notes: deliveryDate,
      json_data: subscriptions,
    });
    return false;
  }
};

const skipOneSubscription = (customerHash, date, subscriptionId) => {
  return new Promise((resolve, reject) => {
    try {
      var options = {
        headers: {
          "X-Recharge-Access-Token": RECHARGE_ACCESS_TOKEN,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };

      axios
        .get(
          `https://fitlife-foods.shopifysubscriptions.com/customers/${customerHash}/charges/skip?date=${date}&charge_id=&item_ids[0]=${subscriptionId}`,
          options
        )
        .then(function (response) {
          // console.log(response);
          resolve(response);
        })
        .catch(function (error) {
          console.error(error);
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

// TODO: If the week has onetime remove it because it will throw the portal in error
const skipOneWeekDelivery = async (deliveryDate, hash, subscriptions) => {
  try {
    for (let i = 0; i < subscriptions.length; i++) {
      const subscription = subscriptions[i];
      await skipOneSubscription(hash, deliveryDate, subscription.id);
    }
    return "ok";
  } catch (error) {
    await logErrors({
      customer_id: hash,
      function_name: "skipOneWeekDelivery",
      notes: deliveryDate,
      json_data: subscriptions,
    });
    return false;
  }
};

const processNextWeekMeals = (nextWeekDelivery, nextChargeDate) => {
  return nextWeekDelivery.map((subscription) => {
    let shopifyVariantId = "";
    let qty = "";
    for (const key in subscription) {
      if (subscription.hasOwnProperty(key)) {
        const element = subscription[key];
        if (key === "qty") {
          qty = element;
        } else {
          shopifyVariantId = element;
        }
      }
    }
    return {
      charge_interval_frequency: "1",
      next_charge_scheduled_at: nextChargeDate,
      order_interval_frequency: "1",
      order_interval_unit: "week",
      quantity: parseInt(qty, 10),
      shopify_variant_id: shopifyVariantId,
    };
  });
};

const updateNextWeeksSubscriptions = async (
  processedSubscriptions,
  addressId
) => {
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

/**
 * Swapping out upcoming  is actually swapping out all future orders
 * No way to just swap only per week.
 * Possibly having a default delivery day and default meals
 * Meals can be future standing. as well. Taking the latest
 */
const swapOutUpComingDelivery = async (
  weekDelivery,
  deliveryDate,
  subscriptions,
  customer_email,
  customer_id
) => {
  const [mealPlan] = subscriptions.filter((subscription) => {
    const { product_title } = subscription;
    return product_title.toLowerCase().includes(" meals:");
  });

  if (!mealPlan) {
    await logErrors({
      customer_email,
      customer_id,
      function_name: "swapOutUpComingDelivery",
      notes: "Meal Plan not found",
      json_data: {
        weekDelivery,
        deliveryDate,
        subscriptions,
      },
    });
    return false;
  }

  const nextChargeDate = mealPlan.next_charge_scheduled_at.replace(
    "T00:00:00",
    ""
  );

  // TODO: check on this at a later time
  if (nextChargeDate !== deliveryDate && deliveryDate !== getNextChargeDate()) {
    return false;
  }

  const justMeals = subscriptions.filter((subscription) => {
    const { status, price } = subscription;
    return price === 0 && status !== "ONETIME";
  });
  const mealSubscriptionIds = justMeals.map((subscription) => {
    return {
      id: subscription.id,
    };
  });
  const addressId = mealPlan.address_id;

  try {
    const nextWeekSubscriptionIds = processNextWeekMeals(
      weekDelivery,
      deliveryDate
    );

    if (!nextWeekSubscriptionIds.length) {
      await logErrors({
        customer_email,
        customer_id,
        function_name: "swapOutUpComingDelivery",
        notes: "Did not update because there were no next week",
        json_data: {
          weekDelivery,
          deliveryDate,
          subscriptions,
          mealPlan,
          nextChargeDate,
          justMeals,
          mealSubscriptionIds,
          addressId,
        },
      });
    }

    if (mealSubscriptionIds.length) {
      await bulkDeleteSubscription(mealSubscriptionIds, addressId);
    }

    await updateNextWeeksSubscriptions(nextWeekSubscriptionIds, addressId);

    return "ok";
  } catch (error) {
    await logErrors({
      customer_email,
      customer_id,
      function_name: "swapOutUpComingDelivery",
      json_data: {
        weekDelivery,
        deliveryDate,
        subscriptions,
        mealPlan,
        nextChargeDate,
        justMeals,
        mealSubscriptionIds,
        addressId,
      },
    });
    return false;
  }
};

const processWeeklyFromMealPlanChange = async (
  weekly_deliveries,
  weekly_deliveries_bulk,
  customer_email,
  customer_id
) => {
  try {
    const weeklyDeliveries = JSON.parse(weekly_deliveries);
    const allDates = Object.keys(weeklyDeliveries);
    const firstDate = allDates[0];
    const firstWeekDelivery = weeklyDeliveries[firstDate];
    const stringFirstWeek =
      weekly_deliveries_bulk || JSON.stringify(firstWeekDelivery);
    let customer, subscriptions;

    for (const deliveryDate in weeklyDeliveries) {
      const deliveries = weeklyDeliveries[deliveryDate];
      if (deliveries === "skipped") {
        if (!customer) {
          customer = await getCustomerHash(customer_id);
        }
        if (!subscriptions) {
          subscriptions = await getAllSubscriptionForCustomer(customer_id);
        }
        await skipOneWeekDelivery(deliveryDate, customer.hash, subscriptions);
        // delete weeklyDeliveries[deliveryDate];
        // skip
      } else if (deliveries === "deliver") {
        delete weeklyDeliveries[deliveryDate];
      } else {
        const stringDelivery = JSON.stringify(deliveries);
        if (stringFirstWeek === stringDelivery) {
          delete weeklyDeliveries[deliveryDate];
        }
      }
    }

    // TODO if empty object sent over null
    await createOrReplaceDeliveriesData(
      Object.keys(weeklyDeliveries).length ? weeklyDeliveries : null,
      customer_email,
      customer_id
    );
    return "ok";
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports.getMealPlan = async () => {
  const subscriptions = await getAllSubscriptions();
  const [mealPlan] = subscriptions.filter((subscription) => {
    const { product_title } = subscription;
    return product_title.toLowerCase().includes(" meals:");
  });
  return mealPlan;
};

module.exports.updateCustomerMealPlan = async (customer) => {
  const {
    customer_email,
    customer_id,
    has_changed_meal_plan,
    has_been_updated,
    subscription_meal_plan,
    weekly_delivery_day,
    weekly_deliveries,
    weekly_deliveries_bulk,
    add_on_products,
  } = customer;

  if (!weekly_deliveries || !subscription_meal_plan) {
    return;
  }

  try {
    const mealSubscription = await getMealSubscriptionIds(customer_id);
    let { mealSubscriptionIds, addressId, mealPlan } = mealSubscription;

    if (!addressId) {
      // Possible customer_id
      await logErrors({
        customer_email,
        customer_id,
        function_name: "updateCustomerMealPlan",
        notes: "No Address ID Found",
        json_data: customer,
      });
    }

    const mealPlanVariantId = await getSubscriptionMealPlanId(
      subscription_meal_plan
    );

    // TODO: temp solution to block from deleting all subscriptions
    const processedSubscriptions = await processWeeklyDeliveries(
      weekly_deliveries,
      mealPlanVariantId,
      weekly_deliveries_bulk
    );

    if (processedSubscriptions.length === 1) {
      await generalLog({
        customer_id,
        customer_email,
        function_name: "updateCustomerMealPlan",
        notes: `Customer changed meal plan but did not update meals`,
        json_data: {
          customer,
          processedSubscriptions,
        },
      });
      await removeFromQueue(customer_email);
      return "not updated";
    }

    await createSubscriptionBulk(
      weekly_deliveries,
      mealPlanVariantId,
      addressId,
      weekly_deliveries_bulk
    );

    await bulkDeleteSubscription(mealSubscriptionIds, addressId);

    //  what if customer switch plans then skipped right away.
    await processWeeklyFromMealPlanChange(
      weekly_deliveries,
      weekly_deliveries_bulk,
      customer_email,
      customer_id
    );

    await resetMealPlanData(customer_email);
    return "okay";
  } catch (error) {
    console.log(error);
  }
};

// Make metafields to singular
module.exports.updateCustomerDeliveries = async (
  weekly_deliveries,
  customer_email,
  customer_id
) => {
  try {
    if (!weekly_deliveries) {
      return false;
    }
    const weeklyDeliveries = JSON.parse(weekly_deliveries);
    if (!Object.keys(weeklyDeliveries).length) {
      await createOrReplaceDeliveriesData(null, customer_email, customer_id);
      return false;
    }

    let hash, customer;
    try {
      customer = await getCustomerHash(customer_id);
      hash = customer.hash;
    } catch (error) {
      // TODO update customer id in database
      customer = await getRechargeCustomerByEmail(customer_email);
      hash = customer.hash;
      customer_id = customer.id;
    }

    const subscriptions = await getAllSubscriptionForCustomer(customer_id);
    if (!subscriptions.length) {
      if (customer.status === "INACTIVE") {
        await resetFieldForCanceledCustomer(customer_email, customer_id);
        await generalLog({
          customer_id,
          customer_email,
          function_name:
            "updateCustomerDeliveries > resetFieldForCanceledCustomer",
          notes: `Inactive customer`,
          json_data: {
            weekly_deliveries,
          },
        });
      } else {
        await logErrors({
          customer_email,
          customer_id,
          notes: "Active Customer with subscriptions!!!",
          action: "updateCustomerDeliveries",
          json_data: {
            weekly_deliveries,
          },
        });
      }
      return false;
    }

    for (const deliveryDate in weeklyDeliveries) {
      const weekDelivery = weeklyDeliveries[deliveryDate];
      if (weekDelivery === "deliver") {
        await unSkipOneWeekDelivery(
          deliveryDate,
          hash,
          customer_id,
          subscriptions
        );
        await generalLog({
          customer_id: customer_id,
          customer_email,
          function_name: "updateCustomerDeliveries > unSkipOneWeekDelivery",
          notes: `Customer Hash ${hash}`,
          json_data: {
            "weeklyDeliveries[deliveryDate]": weeklyDeliveries[deliveryDate],
            deliveryDate: deliveryDate,
            subscriptions,
          },
        });
        delete weeklyDeliveries[deliveryDate];
        await createOrReplaceDeliveriesData(
          weeklyDeliveries,
          customer_email,
          customer_id
        );
      } else if (weekDelivery === "skipped") {
        const lastWeekCharge = getLastWeekDayOccurrence(
          new Date(),
          "Wednesday"
        );
        if (deliveryDate === lastWeekCharge) {
          delete weeklyDeliveries[deliveryDate];
          await createOrReplaceDeliveriesData(
            weeklyDeliveries,
            customer_email,
            customer_id
          );
          console.log(`The Week of ${lastWeekCharge} Deleted`);
          continue;
        }
        const [charges] = await getSkippedCharges(customer_id, deliveryDate);
        if (charges) {
          const chargeScheduledAtDate = charges.scheduled_at.split("T")[0];
          if (chargeScheduledAtDate === deliveryDate) {
            console.log("Skipped Already: Return");
            continue;
          }
        }
        await skipOneWeekDelivery(deliveryDate, hash, subscriptions);
        await generalLog({
          customer_id: customer_id,
          customer_email: customer_email,
          function_name: "updateCustomerDeliveries > skipOneWeekDelivery",
          notes: `Customer Hash ${hash}`,
          json_data: {
            "weeklyDeliveries[deliveryDate]": weeklyDeliveries[deliveryDate],
            deliveryDate,
            subscriptions,
          },
        });
      } else if (weekDelivery.length) {
        const lastWeekCharge = getLastWeekDayOccurrence(
          new Date(),
          "Wednesday"
        );
        if (deliveryDate === lastWeekCharge) {
          delete weeklyDeliveries[deliveryDate];
          await createOrReplaceDeliveriesData(
            weeklyDeliveries,
            customer_email,
            customer_id
          );
          continue;
        }
        const isUpdatedSuccess = await swapOutUpComingDelivery(
          weekDelivery,
          deliveryDate,
          subscriptions,
          customer_email,
          customer_id
        );

        if (isUpdatedSuccess) {
          await generalLog({
            customer_id: customer_id,
            customer_email: customer_email,
            function_name: "updateCustomerDeliveries > swapOutUpComingDelivery",
            json_data: {
              "weeklyDeliveries[deliveryDate]": weeklyDeliveries[deliveryDate],
              isUpdatedSuccess,
              weekDelivery,
              deliveryDate,
              subscriptions,
            },
          });
          delete weeklyDeliveries[deliveryDate];
          await createOrReplaceDeliveriesData(
            weeklyDeliveries,
            customer_email,
            customer_id
          );
        }
      }
    }

    return weeklyDeliveries;
  } catch (error) {
    console.log(error);
    await logErrors({
      action: "updateCustomerDeliveries",
      json_data: {
        weekly_deliveries,
        customer_email,
        customer_id,
        error,
      },
    });
    throw error;
  }
};

module.exports.updateCustomerAddon = async (
  add_on_products,
  customer_email,
  customer_id
) => {
  try {
    if (!add_on_products) {
      return "ok";
    }
    const addons = JSON.parse(add_on_products);
    if (!addons.length) {
      await resetAddOnData(customer_email);
      return "ok";
    }
    const subscriptions = await getAllSubscriptionForCustomer(customer_id);

    if (!subscriptions.length) {
      await logErrors({
        customer_email,
        customer_id,
        function_name: "updateCustomerAddon",
        notes: "No subscription found in addons",
        json_data: {
          add_on_products,
        },
      });
      return false;
    }

    const [mealPlan] = subscriptions.filter((subscription) => {
      const { product_title } = subscription;
      return product_title.toLowerCase().includes(" meals:");
    });

    const currentAddons = subscriptions.filter((subscription) => {
      const { price, product_title } = subscription;
      return price > 0 && !product_title.includes(" Meals:");
    });

    await removeAddon(currentAddons, mealPlan.address_id);

    if (addons.length && addons[0] !== "clearAddOns") {
      await addAddon(
        addons,
        mealPlan.next_charge_scheduled_at,
        mealPlan.address_id
      );
    }

    await generalLog({
      function_name: "updateCustomerAddon",
      notes: "Updated customer addons",
      customer_id: customer_id,
      json_data: {
        addons,
        currentAddons,
        mealPlan,
      },
    });

    await resetAddOnData(customer_email);
    return "ok";
  } catch (error) {
    await logErrors({
      customer_email,
      customer_id,
      function_name: "updateCustomerAddon",
      json_data: {
        add_on_products,
        error: JSON.stringify(error),
      },
    });
    console.log(error);
  }
};

const processMovingSkippedMeals = async (
  customer,
  thisWeekWednesday,
  nextWeekWednesday
) => {
  try {
    const { weekly_deliveries, customer_id, customer_email } = customer;
    if (weekly_deliveries) {
      const weeklyDeliveries = JSON.parse(weekly_deliveries);
      if (weeklyDeliveries[thisWeekWednesday] === "skipped") {
        const subscriptions = await getActiveSubscriptionByCustomerId(
          customer_id
        );
        const [mealPlan] = subscriptions.filter((subscription) =>
          subscription.product_title.includes("Meals: ")
        );
        if (!mealPlan) {
          console.log("NO Meal Plan", customer);
          const [rechargeCustomerProfile] = await findCustomerByEmail(
            customer_email
          );
          console.log(rechargeCustomerProfile);
          if (rechargeCustomerProfile.status !== "INACTIVE") {
            console.log("Customer Inactive but yet has no meals");
            await logErrors({
              customer_id,
              customer_email,
              notes: "ISSUE: Customer Inactive but yet has no meals",
              function_name: "moveChargeDateForUpcomingSkipped",
              json_data: { customer },
            });
          }
          await generalLog({
            customer_id,
            customer_email,
            notes: "Customer canceled but still in the system",
            function_name: "moveChargeDateForUpcomingSkipped",
            json_data: { customer },
          });
          await resetFieldForCanceledCustomer(customer_email, customer_id);
          return;
        }

        const { next_charge_scheduled_at } = mealPlan;
        const isAllNextChargeDateTheSame = subscriptions.every(
          (subscription) =>
            subscription.next_charge_scheduled_at === next_charge_scheduled_at
        );

        if (!isAllNextChargeDateTheSame) {
          console.log("What.......... why aren't they all the same");
          await logErrors({
            customer_id,
            customer_email,
            notes: "ISSUE: What.......... why aren't they all the same",
            function_name: "moveChargeDateForUpcomingSkipped",
            json_data: {
              customer,
              subscriptions,
            },
          });
        }

        // const dateNextChargeFromMeal = next_charge_scheduled_at.split("T")[0];
        if (!next_charge_scheduled_at.includes(thisWeekWednesday)) {
          console.log(
            "Next Charge Date is not coming up",
            customer_email,
            weeklyDeliveries
          );
          console.log(next_charge_scheduled_at, thisWeekWednesday);
          return;
        }

        const processedSubscription = subscriptions.map((subscription) => {
          const { id } = subscription;
          return {
            id: id,
            next_charge_scheduled_at: nextWeekWednesday,
          };
        });

        // console.log("Dry Run - Processed skipped", customer_email, weeklyDeliveries, processedSubscription);
        // return;
        const result = await updateSubscriptionsBulk(
          processedSubscription,
          mealPlan.address_id
        );
        await removeSAndD(mealPlan.address_id);
        console.log(
          "CRON: Processed skipped",
          customer_email,
          weeklyDeliveries
        );
        await generalLog({
          customer_id,
          customer_email,
          notes: "CRON: Processed skipped",
          function_name: "moveChargeDateForUpcomingSkipped",
          json_data: { customer },
        });
      }
    }
    return "okay";
  } catch (error) {
    console.log("Error: processMovingSkippedMeals", error);
    throw error;
  }
};

module.exports.moveChargeDateForUpcomingSkipped = async () => {
  const thisWeekWednesday = getThisWeekDayOccurrence(new Date(), "Wednesday");
  const nextWeekWednesday = getNextWeekDayOccurrence(new Date(), "Wednesday");
  try {
    const customers = await getCustomersWithWeeklyDeliveries();
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      try {
        // Todo do distributive processing
        await processMovingSkippedMeals(
          customer,
          thisWeekWednesday,
          nextWeekWednesday
        );
      } catch (error) {
        try {
          await processMovingSkippedMeals(
            customer,
            thisWeekWednesday,
            nextWeekWednesday
          );
        } catch (error) {
          await logErrors({
            function_name: "moveChargeDateForUpcomingSkipped",
            notes: "Could not skip meals twice",
            json_data: customer,
            error: error,
          });
          continue;
        }
      }
    }
    console.log("Complete: moveChargeDateForUpcomingSkipped");
  } catch (error) {
    console.log("Error: moveChargeDateForUpcomingSkipped", error);
    await logErrors({
      function_name: "moveChargeDateForUpcomingSkipped",
      notes: "FINAL",
    });
    // Do an axios call to restart the whole process
    throw error;
  }
};

module.exports.areAllUpcomingDeliveryGood = async () => {
  const thisWeekWednesday = getThisWeekDayOccurrence(new Date(), "Wednesday");
  const nextWeekWednesday = getNextWeekDayOccurrence(new Date(), "Wednesday");

  const limit = 50;
  const nextChargeDate = getThisWeekDayOccurrence(new Date(), "Wednesday");
  let keepLooping = true;

  try {
    const result = await getAllChargesOnDate(nextChargeDate, limit);
    //Meals

    const {
      body: { charges },
    } = result;
    let res = result.res;

    for (let i = 0; i < charges.length; i++) {
      const charge = charges[i];
      await isDeliveryMealCorrect(charge, i);
    }

    while (keepLooping) {
      const link = cleanLinkHeader(res.headers.link, "next");
      if (!link) {
        console.log("Finished");
        keepLooping = false;
        return "Finished";
      }
      const result = await getRechargeRequest(link);
      const {
        body: { charges },
      } = result;
      res = result.res;
      for (let i = 0; i < charges.length; i++) {
        const charge = charges[i];
        await isDeliveryMealCorrect(charge, nextChargeDate);
      }
    }
    console.log("Finished");
  } catch (error) {
    throw error;
  }
};
