const pool = require("../database/connection");
const { getCustomerByEmail } = require("../models/customerModel");
const { getAddressByCustomerId } = require("../models/recharge/address");
const { getAllActiveCustomer } = require("../models/recharge/customer");
const { getAllChargesOnDate } = require("../models/recharge/charges");
const { getRechargeRequest } = require("../models/recharge/link");
const {
  getActiveSubscriptionByCustomerId,
} = require("../models/recharge/subscription");
const {
  listOneTimes,
  removeOneTime,
  addSurpriseAndDelightToNextOrder,
} = require("../service/addOneTimeProduct");
const getThisWeekDayOccurrence = require("../util/getThisWeekDayOccurrence");
const { cleanLinkHeader } = require("../util/cleanData");

module.exports.getAllSAndD = async () => {
  try {
    const promisePool = pool.promise();
    let query = "SELECT * FROM `surprise_and_delight`";
    const [rows] = await promisePool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports.removeSAndD = async (addressId) => {
  try {
    const oneTimes = await listOneTimes(addressId);
    if (oneTimes && oneTimes.length) {
      for (let i = 0; i < oneTimes.length; i++) {
        const { id } = oneTimes[i];
        await removeOneTime(id);
      }
    }
    return "ok";
  } catch (error) {
    throw error;
  }
};

const processSAndD = async (charges, nextChargeDate) => {
  const { email, line_items, note_attributes, address_id } = charges;

  const customerData = await getCustomerByEmail(email);
  if (customerData.length) {
    console.log(customerData);
    const { weekly_deliveries } = customerData[0];
    if (weekly_deliveries) {
      const weeklyDeliveries = JSON.parse(weekly_deliveries);
      if (weeklyDeliveries[nextChargeDate]) {
        console.log(`==== ${weeklyDeliveries[nextChargeDate]} ========`);
        if (weeklyDeliveries[nextChargeDate] === "skipped") {
          console.log("SKIP: customer skip week: ", email);
          return;
        }
      }
    }
  }

  const [mealPlan] = line_items.filter((item) =>
    item.title.includes("Meals:")
  );

  if (!mealPlan) {
    console.log("mealPlan Not Found");
  }

  const [orderSequence] = note_attributes.filter(
    (notes) => notes.name === "Order Sequence"
  );

  if (!orderSequence) {
    console.log("orderSequence not found");
  }

  await addSurpriseAndDelightToNextOrder(
    +orderSequence.value + 1,
    address_id,
    nextChargeDate
  );
};

module.exports.addSAndDForAllCustomers = async () => {
  const limit = 50;
  const nextChargeDate = getThisWeekDayOccurrence(new Date(), "Wednesday");
  let keepLooping = true;

  try {
    const result = await getAllChargesOnDate(nextChargeDate, limit);
    const {
      body: { charges },
    } = result;
    let res = result.res;

    for (let i = 0; i < charges.length; i++) {
      const charge = charges[i];
      await processSAndD(charge, nextChargeDate);
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
        await processSAndD(charge, nextChargeDate);
      }
    }
    console.log("Finished");
  } catch (error) {
    throw error;
  }
};
