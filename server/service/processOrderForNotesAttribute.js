const { findStoreByZipCode } = require("../controller/storeController");
const { logErrors } = require("../models/errorLogs");
const getNextWeekDayOccurrence = require("../util/getNextWeekDayOccurrence");
const { updateNoteAttributeShopify, updateNoteAttributeRecharge } = require("./updateNoteAttribute");

module.exports.processOrderForNotesAttribute = async (
  order,
  deliveryDayAPI,
  deliveryDateAPI,
  orderSequenceAPI,
) => {
  const {
    shopify_order_id,
    note_attributes,
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
    dbId,
    zipCode;
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
    } else if (name === "Zip Code") {
      zipCode = value;
    }
  });

  if(!deliveryDate) {
    deliveryDate = deliveryDateAPI;
  }
  if(!deliveryDay) {
    deliveryDay = deliveryDayAPI;
  }

  // Adding extra fields
  const [mealPlan] = line_items.filter((line_item) =>
    line_item.product_title.includes(" Meals:")
  );
  const { product_title } = mealPlan;
  const [numMealFound, packageSizeFound] = product_title
    .replace(" Plan", "")
    .split(" Meals:");

  try {
    const nextDeliveryDate = getNextWeekDayOccurrence(
      new Date(),
      deliveryDay,
      "american"
    );

    const newNotes = {};
    let shippingZipCode = shipping_address.zip;
    if (shippingZipCode.includes("-")) {
      shippingZipCode = shippingZipCode.split("-")[0];
    }
    let storeObj = await findStoreByZipCode(shippingZipCode);
    if (storeObj) {
      newNotes["Zip Code"] = storeObj.zipcode;
      newNotes["Store"] = storeObj.store;
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

    if (deliveryDayAPI) {
      note_attributes.push({
        name: "Delivery Day",
        value: deliveryDayAPI,
      });
    }

    if(deliveryDateAPI) {
      note_attributes.push({
        name: "Delivery Date",
        value: deliveryDateAPI,
      });
    }
    
    if(!zipCode) {
      note_attributes.push({
        name: "Zip Code",
        value: storeObj.zipcode,
      });
    }

    if(!storeName) {
      note_attributes.push({
        name: "Store",
        value: storeObj.store,
      });
    }

    if (!orderSequence || orderSequenceAPI) {
      note_attributes.push({
        name: "Order Sequence",
        value: orderSequenceAPI ? orderSequenceAPI : "1",
      });
    }
    else {
      orderSequence = parseInt(orderSequence) + 1;
      newNotes["Order Sequence"] = orderSequence;
    }

    // newNotes["Delivery Date"] = nextDeliveryDate;
    await updateNoteAttributeShopify(
      shopify_order_id,
      note_attributes,
      newNotes
    );

    // await updateNoteAttributeRecharge(address_id, note_attributes, newNotes);
    console.log(`updateNoteAttributeRecharge`, note_attributes, newNotes);

    // Tags Old tags don't make it to the new orders
    // await tagOrderRemove(shopify_order_id, [deliveryDate]);
    // await tagOrderAdd(shopify_order_id, nextDeliveryDate);
    // await tagOrderAdd(shopify_order_id, `Store: ${storeName}`);

    console.log(
      "============== FINISHED processOrderForNotesAttribute ================"
    );
    return "Success";
  } catch (error) {
    console.log("Error: processOrderForNotesAttribute");
    await logErrors({
      customer_email: customer.email,
      customer_id: customer_id,
      action: "processOrderForNotesAttribute",
      notes: "Still did not update correctly",
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

module.exports.processOrderForNotesAttributeRecharge = async (
  order,
  deliveryDayAPI,
  deliveryDateAPI,
  orderSequenceAPI,
) => {
  const {
    address_id,
    shopify_order_id,
    note_attributes,
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
    dbId,
    zipCode;
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
    } else if (name === "Zip Code") {
      zipCode = value;
    }
  });

  if(!deliveryDate) {
    deliveryDate = deliveryDateAPI;
  }
  if(!deliveryDay) {
    deliveryDay = deliveryDayAPI;
  }

  const [mealPlan] = line_items.filter((line_item) =>
    line_item.product_title.includes(" Meals:")
  );
  const { product_title } = mealPlan;
  const [numMealFound, packageSizeFound] = product_title
    .replace(" Plan", "")
    .split(" Meals:");

  try {
    const nextDeliveryDate = getNextWeekDayOccurrence(
      new Date(),
      deliveryDay,
      "american"
    );

    const newNotes = {};
    let shippingZipCode = shipping_address.zip;
    if (shippingZipCode.includes("-")) {
      shippingZipCode = shippingZipCode.split("-")[0];
    }
    let storeObj = await findStoreByZipCode(shippingZipCode);
    if (storeObj) {
      newNotes["Zip Code"] = storeObj.zipcode;
      newNotes["Store"] = storeObj.store;
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

    if (deliveryDayAPI) {
      note_attributes.push({
        name: "Delivery Day",
        value: deliveryDayAPI,
      });
    }

    if(deliveryDateAPI) {
      note_attributes.push({
        name: "Delivery Date",
        value: deliveryDateAPI,
      });
    }
    
    if(!zipCode) {
      note_attributes.push({
        name: "Zip Code",
        value: storeObj.zipcode,
      });
    }

    if(!storeName) {
      note_attributes.push({
        name: "Store",
        value: storeObj.store,
      });
    }

    if (!orderSequence || orderSequenceAPI) {
      note_attributes.push({
        name: "Order Sequence",
        value: orderSequenceAPI ? orderSequenceAPI : "1",
      });
    }
    else {
      orderSequence = parseInt(orderSequence) + 1;
      newNotes["Order Sequence"] = orderSequence;
    }

    // newNotes["Delivery Date"] = nextDeliveryDate;

    await updateNoteAttributeRecharge(address_id, note_attributes, newNotes);
    console.log(`updateNoteAttributeRecharge`, note_attributes, newNotes);

    console.log(
      "============== FINISHED processOrderForNotesAttributeRecharge ================"
    );
    return "Success";
  } catch (error) {
    console.log("Error: processOrderForNotesAttributeRecharge");
    await logErrors({
      customer_email: customer.email,
      customer_id: customer_id,
      action: "processOrderForNotesAttributeRecharge",
      notes: "Still did not update correctly",
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
