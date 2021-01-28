const {
  updateCustomerMealPlan,
  updateCustomerDeliveries,
  updateCustomerAddon,
} = require("./mealController");
const { logErrors } = require("../models/errorLogs");
const {
  customerLogReset,
  getAllUpdatedCustomer,
  getAllCustomer,
  addRechargeIdToCustomer,
  getCustomersWithWeeklyDeliveries,
  getCustomerByEmail,
  getCustomersWithWeeklyDeliveriesForComingWednesday,
} = require("../models/customerModel");
const { findCustomerByEmail } = require("../models/recharge/customer");
const { generalLog } = require("../models/generalLogs");
const { replaceWeeklyMealsVariantSku } = require("../service/customerService");
const {getNextChargeDate} = require("../util/dates");

const processCustomersData = async (customer) => {
  const {
    customer_email,
    has_changed_meal_plan,
    weekly_deliveries,
    weekly_deliveries_bulk,
    add_on_products,
  } = customer;

  let { customer_id } = customer;

  try {
    if (!customer_id) {
      const [rechargeCustomer] = await findCustomerByEmail(customer_email);
      customer.customer_id = rechargeCustomer.id;
      customer_id = rechargeCustomer.id;
      await addRechargeIdToCustomer(customer_email, customer_id);
    }

    if (has_changed_meal_plan || weekly_deliveries_bulk) {
      const result = await updateCustomerMealPlan(customer);
      await generalLog({
        customer_id: customer_id,
        function_name: "processCustomersData",
        notes: "Meals have been changed " + result,
        json_data: customer,
      });
    } else {
      const hasUpdated = await updateCustomerDeliveries(
        weekly_deliveries,
        customer_email,
        customer_id
      );
      if (hasUpdated) {
        await generalLog({
          customer_id: customer_id,
          customer_email: customer_email,
          function_name: "processCustomersData",
          notes: "Meals have NOT been changed",
          json_data: customer,
        });
      }
    }

    await updateCustomerAddon(add_on_products, customer_email, customer_id);
    await customerLogReset(customer_email);
    return "ok";
  } catch (error) {
    throw error;
  }
};

const setupCustomersToProcess = async (customers, function_name) => {
  console.log("====================================================");
  console.log(`+++++++  ${function_name} START ++++++++++++++++`);
  console.log("====================================================");
  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    const customerId = customer.customer_id;
    const hasChangedMeals = !!customer.has_changed_meal_plan;
    try {
      await processCustomersData(customer, hasChangedMeals);
      console.log(`====  ${i}  ====`);
    } catch (error) {
      console.log("====================================================");
      console.log("=========  ERROR: setupCustomersToProcess ==========");
      console.log(`=========  ERROR: ${function_name} ================`);
      console.log("====================================================");
      await logErrors({
        customer_id: customerId,
        function_name: function_name,
        notes: "Processing: setupCustomersToProcess",
        json_data: {
          customer,
          error,
        },
      });
    }
  }
  console.log("====================================================");
  console.log(`+++++++  ${function_name} complete ++++++++++++++++`);
  console.log("====================================================");
  return `${function_name} complete`;
};

module.exports.doesCustomerExist = async (email) => {
  try {
    const customers = await findCustomerByEmail(email);
    if (customers.length) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    await logErrors({
      customer_email: email,
      function_name: "doesCustomerExist",
      notes: "Recharge Checkout find customer error",
      json_data: error,
    });
    throw error;
  }
};

module.exports.updateAllSubscriptions = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const updatedCustomers = await getAllUpdatedCustomer();
      resolve("ok");
      process.nextTick(() => {
        setupCustomersToProcess(updatedCustomers, "updateAllSubscriptions");
      });
    } catch (error) {
      console.log(
        "Error: SELECT * FROM `customer_log` WHERE `has_been_updated` = ?"
      );
      // reject(error);
    }
  });
};

module.exports.updateAllCustomersLong = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allCustomers = await getAllCustomer();
      resolve("ok");
      process.nextTick(() => {
        setupCustomersToProcess(allCustomers, "updateAllCustomersLong");
      });
    } catch (error) {
      console.log("Error: SELECT * FROM `customer_log`");
      // reject(error);
    }
  });
};

module.exports.updateCustomersWidthWeeklyDeliveries = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const customers = await getCustomersWithWeeklyDeliveries();
      resolve("ok");
      process.nextTick(() => {
        setupCustomersToProcess(
          customers,
          "updateCustomersWidthWeeklyDeliveries"
        );
      });
    } catch (error) {
      console.log(
        "Error: SELECT * FROM `customer_log` WHERE `weekly_deliveries` IS NOT NULL"
      );
      // reject(error);
    }
  });
};

module.exports.updateCustomerByEmail = async (customerEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      const customers = await getCustomerByEmail(customerEmail);
      await setupCustomersToProcess(customers, "updateCustomerByEmail");
      resolve();
    } catch (error) {
      console.log("Error: SELECT * FROM `customer_log` WHERE customer_email=?");
      reject(error);
    }
  });
};

module.exports.updateLeftOverMealsForThisWeek = async () => {
  try {
    const customers = await getCustomersWithWeeklyDeliveriesForComingWednesday(getNextChargeDate());
    await setupCustomersToProcess(customers, "updateLeftOverMealsForThisWeek");
  } catch (error) {
    console.log("Error: SELECT * FROM `customer_log` WHERE customer_email=?");
    throw error;
  }
};

module.exports.replaceCustomerMenuItems = async (originalItem, newItem) => {
  try {
    const customers = await getCustomersWithWeeklyDeliveries();
    const result = await replaceWeeklyMealsVariantSku(
      customers,
      originalItem,
      newItem
    );
    return result;
  } catch (error) {
    console.log(
      "Error: SELECT * FROM `customer_log` WHERE `weekly_deliveries` IS NOT NULL"
    );
    throw error;
  }
};
