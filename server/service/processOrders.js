const getThisWeekDayOccurrence = require("../util/getThisWeekDayOccurrence");
const getNextWeekDayOccurrence = require("../util/getNextWeekDayOccurrence");
const { setNextChargeDateBulk } = require("./Recharge");
const { tagOrderAdd } = require("./graphQLTagOrders");
const {
  updateNoteAttributeShopify,
  updateNoteAttributeRecharge,
} = require("./updateNoteAttribute");
const { findStoreByZipCode } = require("../controller/storeController");
const { getAllSubscriptions } = require("../controller/subscriptionController");
const { getEastCoastDate } = require("../util/dates");
const {
  removeOldDateFromMetaObject,
} = require("../util/removeOldDateFromMetaObject");
const { generalLog } = require("../models/generalLogs");
const { orderErrorsLogs, logErrors } = require("../models/errorLogs");
const {
  getWeeklyDeliveryDayData,
  getDeliveriesData,
  createOrReplaceDeliveriesData,
  createOrReplaceDayData,
} = require("../models/customerModel");
// TODO: Update this to ping the database;

/**
 * The order object from shopify
 * @typedef {{
 *  address_id:Number,
 *  address_is_active:Number,
 *  billing_address:Object,
 *  browser_ip:Null,
 *  charge_id:Number,
 *  charge_status:String,
 *  created_at:String,
 *  currency:String,
 *  customer:Object,
 *  customer_id:Number,
 *  discount_codes:Array,
 *  email:String,
 *  first_name:String,
 *  hash:String,
 *  id:Number,
 *  is_prepaid:Number,
 *  last_name:String,
 *  line_items:Array,
 *  note:String,
 *  note_attributes:Array,
 *  payment_processor:String,
 *  processed_at:String,
 *  scheduled_at:String,
 *  shipped_date:String,
 *  shipping_address:Object,
 *  shipping_date:String,
 *  shipping_lines:Array,
 *  shopify_cart_token:String,
 *  shopify_customer_id:String,
 *  shopify_id:String,
 *  shopify_order_id:String,
 *  shopify_order_number:Number,
 *  status:String,
 *  subtotal_price:String,
 *  tags:String,
 *  tax_lines:Array,
 *  total_discounts:String,
 *  total_line_items_price:Null,
 *  total_price:String,
 *  total_refunds:Null,
 *  total_tax:String,
 *  total_weight:Number,
 *  transaction_id:String,
 *  type:String,
 *  updated_at:String,
 * }} Order
 *
 */

/**
 * Only recharge orders can be handled here. Because of the variables
 * @param {Order} order
 */
module.exports.processFirstOrder = async (order) => {
  console.log("=============== START processFirstOrder ===============");
  const {
    shopify_order_id,
    shipping_address,
    note_attributes,
    line_items,
    address_id,
    customer,
    customer_id,
    id,
  } = order;

  let deliveryDate, deliveryDay, zipCode, dbId, storeName;
  note_attributes.forEach((note) => {
    const { name, value } = note;
    if (name === "Delivery Date") {
      deliveryDate = value;
    } else if (name === "Delivery Day") {
      deliveryDay = value;
    } else if (name === "Zip Code") {
      zipCode = value;
    } else if (name === "DB ID") {
      dbId = value;
    }
  });

  if(!deliveryDate || !deliveryDay) {
    await orderErrorsLogs({
      notes: "Date Invalid",
      function_name: "processFirstOrder",
      json_data: order, 
    });
  }

  const chargeDate = getThisWeekDayOccurrence(deliveryDate, "Wednesday");

  const { subscriptions } = await getAllSubscriptions(customer_id);

  const body = { subscriptions: [] };
  subscriptions.forEach((item) => {
    const { id } = item;
    body.subscriptions.push({
      id: id,
      next_charge_scheduled_at: chargeDate,
    });
  });

  // Adding extra fields
  const [mealPlan] = line_items.filter((line_item) =>
    line_item.product_title.includes(" Meals:")
  );
  const { product_title } = mealPlan;
  const [numMeal, packageSize] = product_title
    .replace(" Plan", "")
    .split(" Meals:");

  try {
    note_attributes.push({
      name: "Package Size",
      value: packageSize.trim(),
    });

    note_attributes.push({
      name: "Number of Meals",
      value: numMeal,
    });

    note_attributes.push({
      name: "Subscription Type",
      value: "Weekly",
    });

    try {
      // Not clear why setting next charge date errors.
      // Returns 404 but still sets the correct charge date
      await setNextChargeDateBulk(address_id, body);
    } catch (error) {
      console.log("Failed setNextChargeDateBulk");
      // TODO just like recurring order get just the subscriptions
      await orderErrorsLogs({
        customer_email: customer.email,
        customer_id: customer_id,
        notes: "Failed setNextChargeDateBulk",
        action: "processFirstOrder",
        route: "/recharge/order/created",
        json_data: {
          recharge_order_id: id,
          shopify_order_id,
          error,
        },
      });
    }

    let shippingZipCode = shipping_address.zip;
    if (shippingZipCode.includes("-")) {
      try {
        shippingZipCode = shippingZipCode.split("-")[0];
      } catch (error) {}
    }
    let storeObj = await findStoreByZipCode(shippingZipCode);
    if (storeObj) {
      const newNotes = {};
      newNotes["Zip Code"] = shipping_address.zip;
      newNotes["Store"] = storeObj.store;
      storeName = storeObj.store;
      newNotes["DB ID"] = storeObj["db-id"];
      const deliveryDayExist = storeObj["delivery-days"].some(
        (day) => day === deliveryDay
      );

      if (!deliveryDayExist) {
        newNotes["Delivery Day"] = storeObj["delivery-days"][0];
        // TODO: not correct. Should be the original week they chosen
        // Should be the same week.
        deliveryDate = getNextWeekDayOccurrence(
          deliveryDate,
          newNotes["Delivery Day"],
          "american"
        );
        newNotes["Delivery Date"] = deliveryDate;
      }

      note_attributes.push({
        name: "DB ID",
        value: newNotes["DB ID"],
      });

      await updateNoteAttributeShopify(
        shopify_order_id,
        note_attributes,
        newNotes
      );
      await updateNoteAttributeRecharge(address_id, note_attributes, newNotes);
    } else {
      await orderErrorsLogs({
        customer_email: customer.email,
        customer_id: customer_id,
        notes: "Store Error: No store found",
        route: "/recharge/order/created",
        json_data: {
          shipping_address,
        },
      });
    }

    await tagOrderAdd(
      shopify_order_id,
      `Store: ${storeName},${deliveryDate},X-First Time Order`
    );

    console.log("============== FINISHED processFirstOrder ================");
    console.log(
      "============== FINISHED /recharge/order/created ================"
    );

    return "Success";
  } catch (error) {
    await orderErrorsLogs({
      customer_email: customer.email,
      customer_id: customer_id,
      notes: "Order Probably not Tagged",
      action: "processFirstOrder",
      route: "/recharge/order/created",
      json_data: {
        recharge_order_id: id,
        shopify_order_id,
        error,
      },
    });
    throw error;
  }
};

/**
 * Only recharge orders can be handled here. Because of the variables
 * @param {Order} order
 */
module.exports.processRecurringOrder = async (order) => {
  const {
    shopify_order_id,
    note_attributes,
    address_id,
    shipping_address,
    line_items,
    customer_id,
    customer,
    id,
  } = order;

  let deliveryDate,
    deliveryDay,
    orderSequence,
    storeName,
    packageSize,
    numMeal,
    subscriptionType,
    dbId;
  note_attributes.forEach((note) => {
    const { name, value } = note;
    if (name === "Delivery Date") {
      deliveryDate = value;
    } else if (name === "Delivery Day") {
      deliveryDay = value;
    } else if (name === "Order Sequence") {
      orderSequence = value;
    } else if (name === "Store") {
      storeName = value;
    } else if (name === "Package Size") {
      packageSize = value;
    } else if (name === "Number of Meals") {
      numMeal = value;
    } else if (name === "Subscription Type") {
      subscriptionType = value;
    } else if (name === "DB ID") {
      dbId = value;
    }
  });

  if (!orderSequence) {
    orderSequence = "1";
  }
  orderSequence = parseInt(orderSequence) + 1;

  // Adding extra fields
  const [mealPlan] = line_items.filter((line_item) =>
    line_item.product_title.includes(" Meals:")
  );
  const { product_title } = mealPlan;
  const [numMealFound, packageSizeFound] = product_title
    .replace(" Plan", "")
    .split(" Meals:");

  try {
    // {"2020-10-16":"Sunday"}
    let dayMetafield = await getWeeklyDeliveryDayData(customer.email);
    try {
      if (Object.keys(dayMetafield).length) {
        const eastCoastDay = getEastCoastDate();
        if (dayMetafield[eastCoastDay]) {
          deliveryDay = dayMetafield[eastCoastDay];
        }

        const newDayMetafield = removeOldDateFromMetaObject(
          dayMetafield,
          eastCoastDay
        );
        if (newDayMetafield.toString() !== dayMetafield.toString()) {
          await generalLog({
            customer_id: customer_id,
            customer_email: customer.email,
            function_name: "processRecurringOrder > removeOldDateFromObject",
            notes: "Day Metafield",
            route: "/recharge/order/created",
            json_data: {
              eastCoastDay: eastCoastDay,
              "dayMetafield[eastCoastDay]": dayMetafield[eastCoastDay],
              dayMetafield,
            },
          });

          const result = await createOrReplaceDayData(
            dayMetafield,
            customer.email,
            customer_id
          );
        }
      }
    } catch (error) {
      console.log(error);
      await orderErrorsLogs({
        customer_email: customer.email,
        customer_id: customer_id,
        notes: "getDayMetafield",
        route: "/recharge/order/created",
        json_data: {
          dayMetafield,
          error,
        },
      });
    }

    const nextDeliveryDate = getNextWeekDayOccurrence(
      new Date(),
      deliveryDay,
      "american"
    );

    const nextChargeDate = getThisWeekDayOccurrence(
      nextDeliveryDate,
      "Wednesday"
    );

    // See if next the next week is a skip if it then do nothing
    // This is unnecessary and complex
    let weeklyDeliveries = await getDeliveriesData(customer.email, customer_id);
    let isSetNextChargeDate = true;
    try {
      if (Object.keys(weeklyDeliveries).length) {
        const eastCoastDate = getEastCoastDate();
        // If the following week is skipped then don't next charge date.
        if (weeklyDeliveries[nextChargeDate] === "skipped") {
          isSetNextChargeDate = false;
        }

        const newWeeklyDeliveries = removeOldDateFromMetaObject(
          weeklyDeliveries,
          eastCoastDate
        );
        if (newWeeklyDeliveries.toString() !== weeklyDeliveries.toString()) {
          await generalLog({
            customer_id: customer_id,
            customer_email: customer.email,
            function_name:
              "processRecurringOrder > removeOldDateFromMetaObject",
            notes: "Weekly Delivery Data",
            json_data: {
              eastCoastDate,
              nextChargeDate,
              "weeklyDeliveries[nextChargeDate]":
                weeklyDeliveries[nextChargeDate],
              isSetNextChargeDate,
              weeklyDeliveries,
            },
          });
          const result = await createOrReplaceDeliveriesData(
            weeklyDeliveries,
            customer.email,
            customer_id
          );
        }
      }
    } catch (error) {
      await orderErrorsLogs({
        customer_email: customer.email,
        customer_id: customer_id,
        notes: "getWeeklyDeliveries",
        route: "/recharge/order/created",
        json_data: {
          weeklyDeliveries,
          error,
        },
      });
    }

    // If the following week isn't skipped then we'll check if the charge dates are the same.
    // If they are the same there isn't a point to change the charge date
    const { subscriptions } = await getAllSubscriptions(customer_id);
    const [mealPlanSubscription] = subscriptions.filter(({ product_title }) =>
      product_title.includes(" Meals:")
    );
    const { next_charge_scheduled_at, status } = mealPlanSubscription;

    if(!next_charge_scheduled_at) {
      isSetNextChargeDate = false;
      if(status === "CANCELLED") {
        // Possible put customer to INACTIVE
      }
      else {
        await logErrors({
          customer_email: customer.email,
          customer_id: customer_id,
          action: "processRecurringOrder",
          notes: "No next_charge_scheduled but not cancelled",
          route: "/recharge/order/created",
          json_data: {
            recharge_order_id: id,
            shopify_order_id,
            error: error,
            errorMessage: error.message,
          },
        });
      }
    }
    else {
      const nextChargeScheduleAtDate = next_charge_scheduled_at.split("T")[0];
      if (nextChargeScheduleAtDate === nextChargeDate) {
        isSetNextChargeDate = false;
      }
    }

    // Unsure if doing this would case less orders with meals:
    // isSetNextChargeDate = true;
    if (isSetNextChargeDate) {
      const body = { subscriptions: [] };
      subscriptions.forEach((item) => {
        const { id } = item;
        body.subscriptions.push({
          id: id,
          next_charge_scheduled_at: nextChargeDate,
        });
      });

      try {
        await setNextChargeDateBulk(address_id, body);
      } catch (error) {
        console.log(
          "Failed setNextChargeDateBulk Recurring swallow error and logs"
        );
        await orderErrorsLogs({
          customer_email: customer.email,
          customer_id: customer_id,
          notes: "Failed setNextChargeDateBulk Recurring",
          route: "/recharge/order/created",
          json_data: {
            address_id,
            body,
            error,
          },
        });
      }
    }

    const newNotes = {};
    let shippingZipCode = shipping_address.zip;
    if (shippingZipCode.includes("-")) {
      try {
        shippingZipCode = shippingZipCode.split("-")[0];
      } catch (error) {}
    }
    let storeObj = await findStoreByZipCode(shippingZipCode);
    if (storeObj) {
      newNotes["Zip Code"] = storeObj.zipcode;
      newNotes["Store"] = storeObj.store;
      storeName = storeObj.store;
      newNotes["DB ID"] = storeObj["db-id"];
      const deliveryDayExist = storeObj["delivery-days"].some(
        (day) => day === deliveryDay
      );
      if (!deliveryDayExist) {
        newNotes["Delivery Day"] = storeObj["delivery-days"][0];
      }
    } else {
      console.log("Store Error: No store found");
    }

    newNotes["Delivery Date"] = nextDeliveryDate;
    newNotes["Order Sequence"] = orderSequence;

    if (!dbId) {
      note_attributes.push({
        name: "DB ID",
        value: newNotes["DB ID"],
      });
    }

    if (!packageSize) {
      note_attributes.push({
        name: "Package Size",
        value: packageSizeFound.trim(),
      });
    } else if (packageSizeFound !== packageSize) {
      newNotes["Package Size"] = packageSizeFound.trim();
    }

    if (!numMeal) {
      note_attributes.push({
        name: "Number of Meals",
        value: numMealFound,
      });
    } else if (numMealFound !== numMeal) {
      newNotes["Number of Meals"] = numMealFound;
    }

    if (!subscriptionType) {
      note_attributes.push({
        name: "Subscription Type",
        value: "Weekly",
      });
    }

    await updateNoteAttributeShopify(
      shopify_order_id,
      note_attributes,
      newNotes
    );

    await updateNoteAttributeRecharge(address_id, note_attributes, newNotes);
    console.log(`updateNoteAttributeRecharge`, newNotes);

    // Tags Old tags don't make it to the new orders
    // await tagOrderRemove(shopify_order_id, [deliveryDate]);
    await tagOrderAdd(
      shopify_order_id,
      `Store: ${storeName},${nextDeliveryDate}`
    );

    console.log(
      "============== FINISHED processRecurringOrder ================"
    );
    console.log(
      "============== FINISHED /recharge/order/created ================"
    );
    return "Success";
  } catch (error) {
    console.log("Error: processRecurringOrder");
    await orderErrorsLogs({
      customer_email: customer.email,
      customer_id: customer_id,
      action: "processRecurringOrder",
      notes: "Order Probably Not Tagged",
      route: "/recharge/order/created",
      json_data: {
        recharge_order_id: id,
        shopify_order_id,
        error: error,
        errorMessage: error.message,
      },
    });
    throw error;
  }
};

module.exports.processShopifyOrder = async (order) => {
  console.log("============== START processShopifyOrder ================");

  const {
    id: shopifyOrderId,
    note_attributes,
    shipping_address,
    note,
    line_items,
    customer,
  } = order;

  let deliveryDate, deliveryDay, storeName;
  note_attributes.forEach((note) => {
    const { name, value } = note;
    if (name === "Delivery Date") {
      deliveryDate = value;
    } else if (name === "Delivery Day") {
      deliveryDay = value;
    } else if (name === "Store") {
      storeName = value;
    }
  });

  try {
    // Adding extra fields
    const [mealPlan] = line_items.filter((line_item) =>
      line_item.title.includes(" Meals:")
    );

    if (mealPlan) {
      const { title } = mealPlan;
      const [numMeal, packageSize] = title
        .replace(" Plan", "")
        .split(" Meals:");

      note_attributes.push({
        name: "Package Size",
        value: packageSize.trim(),
      });

      note_attributes.push({
        name: "Number of Meals",
        value: numMeal,
      });

      note_attributes.push({
        name: "Subscription Type",
        value: "One-Time",
      });
    }

    if (!deliveryDate) {
      // For Orders being imported
      console.log(note);
      console.log("============== END /shopify/order/created ================");
      return "ok";
    }

    let shippingZipCode = shipping_address.zip;
    if (shippingZipCode.includes("-")) {
      shippingZipCode = shippingZipCode.split("-")[0];
    }
    let storeObj = await findStoreByZipCode(shippingZipCode);
    const newNotes = {};
    if (storeObj) {
      newNotes["Zip Code"] = shipping_address.zip;
      newNotes["Store"] = storeObj.store;
      storeName = storeObj.store;
      newNotes["DB ID"] = storeObj["db-id"];
      const deliveryDayExist = storeObj["delivery-days"].some(
        (day) => day === deliveryDay
      );

      if (!deliveryDayExist) {
        newNotes["Delivery Day"] = storeObj["delivery-days"][0];
        deliveryDate = getThisWeekDayOccurrence(
          deliveryDate,
          newNotes["Delivery Day"],
          "american"
        );
        newNotes["Delivery Date"] = deliveryDate;
      }

      note_attributes.push({
        name: "DB ID",
        value: newNotes["DB ID"],
      });

      await updateNoteAttributeShopify(
        shopifyOrderId,
        note_attributes,
        newNotes
      );
    }

    await tagOrderAdd(
      shopifyOrderId,
      `Store: ${storeName},${deliveryDate},X-First Time Order`
    );

    console.log("============== END processShopifyOrder ================");
    console.log("============== END /shopify/order/created ================");

    return "success";
  } catch (error) {
    await orderErrorsLogs({
      customer_email: customer.email,
      customer_id: customer.id,
      notes: "processShopifyOrder",
      action: "order not tagged",
      route: "/shopify/order/created",
      json_data: {
        shopifyOrderId,
        error,
      },
    });
    throw error;
  }
};
