const express = require("express");
const router = express.Router();

const {
  getWeeklyDeliveryDayData,
  createOrUpdateDayData,
  createOrReplaceDayData,
  getDeliveriesData,
  createOrUpdateDeliveriesData,
  resetAllCustomerFields,
  createOrReplaceDeliveriesData,
  updateDeliveriesBulk,
  resetFieldForCanceledCustomer,
} = require("../models/customerModel");
const { getAddressDetailById } = require("../models/recharge/address");
const {
  updateNoteAttributeRecharge,
} = require("../service/updateNoteAttribute");
const { doesCustomerExist } = require("../controller/customerController");
const {
  getAddonData,
  createOrReplaceAddonData,
} = require("../models/addOnModel");
const {
  getMealPlanData,
  createOrReplaceMealPlanData,
} = require("../models/mealPlanModel");
const { deleteAllMetafields } = require("../controller/metafieldController");

// "/api/recharge/put-weekly-delivery-day"
router.post("/get-weekly-delivery-day", async (req, res, next) => {
  const { customerEmail, customerId } = req.body;

  /**
    {
      "2020-09-16": "Sunday",
      "2020-09-23": "Monday",
      "2020-09-30": "Sunday",
      "2020-10-07": "Sunday"
    }  
   */

  try {
    const result = await getWeeklyDeliveryDayData(customerEmail, customerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// "/api/recharge/update-weekly-delivery-day"
router.post("/update-weekly-delivery-day", async (req, res, next) => {
  const { customerId, customerEmail, deliveryDate, deliveryDay } = req.body;

  const dayObj = {
    [deliveryDate]: deliveryDay,
  };

  try {
    const dayResult = await createOrUpdateDayData(
      dayObj,
      customerEmail,
      customerId
    );
    console.log({ dayResult });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/change-default-delivery-day", async (req, res, next) => {
  const { customerId, customerEmail, addressId, deliveryDay } = req.body;

  try {
    await createOrReplaceDayData("", customerEmail, customerId);

    const { note_attributes } = await getAddressDetailById(addressId);
    console.log(note_attributes);
    const newNotes = {};
    newNotes["Delivery Day"] = deliveryDay;
    await updateNoteAttributeRecharge(addressId, note_attributes, newNotes);
    // Somehow get the latest order
    // updateNoteAttributeShopify(shopify_order_id, note_attributes, newNotes);

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/get-weekly-deliveries", async (req, res, next) => {
  const { customerId, customerEmail } = req.body;

  /**
    {
      "2020-09-16": "skipped",
      // User wants to unskip and recharge already set up as skipped
      "2020-09-23": "unskipped",
      // User wants to come from skipped or want to update their meals.
      "2020-09-30": [
        {
          "4468566884399": "32227913826351",
          "qty": 2
        },
        {
          "productId": 4642147106863,
          "id": 32309022261295,
          "qty": 5
        },
        {
          "productId": 4468554235951,
          "id": 32379516485679,
          "qty": 1
        }
      ]
    }  
   */

  try {
    const result = await getDeliveriesData(customerEmail, customerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/update-weekly-deliveries", async (req, res, next) => {
  const { customerId, customerEmail, deliveryDate, deliveries } = req.body;

  const deliveryObj = {
    [deliveryDate]: deliveries,
  };

  try {
    const deliveryResult = await createOrUpdateDeliveriesData(
      deliveryObj,
      customerEmail,
      customerId
    );
    console.log({ deliveryResult });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/update-weekly-deliveries-bulk", async (req, res, next) => {
  const { customerId, customerEmail, deliveryDates, deliveries } = req.body;

  const deliveryObj = {};

  deliveryDates.forEach((date) => {
    deliveryObj[date] = deliveries;
  });

  try {
    const deliveryResult = await createOrReplaceDeliveriesData(
      deliveryObj,
      customerEmail,
      customerId
    );
    console.log({ deliveryResult });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/update-subscription-plan-and-meals", async (req, res, next) => {
  const {
    customerId,
    customerEmail,
    deliveryDates,
    deliveries,
    mealSize,
    mealCount,
  } = req.body;

  const deliveryObj = {};

  deliveryDates.forEach((date) => {
    deliveryObj[date] = deliveries;
  });

  const mealPlan = {
    mealSize,
    mealCount,
  };

  try {
    const deliveryResult = await createOrReplaceDeliveriesData(
      deliveryObj,
      customerEmail,
      customerId
    );

    const deliveryBulk = await updateDeliveriesBulk(
      deliveries,
      customerEmail,
      customerId
    );

    const mealPlanResult = await createOrReplaceMealPlanData(
      mealPlan,
      customerEmail,
      customerId
    );

    console.log({ deliveryResult });
    console.log({ deliveryBulk });
    console.log({ mealPlanResult });

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/get-addon", async (req, res, next) => {
  const { customerId, customerEmail } = req.body;

  /**
    [
      { "4468563181615": "32443268104239", "qty": "2" },
      { "4468559773743": "32443265417263", "qty": "3" },
      { "4473321947183": "32229924929583", "qty": "1" },
    ]

    // This happens when the person is on the modal and adjust the addon while in the model
    [
      {
        "image":"https://cdn.shopify.com/s/files/1/2528/8566/products/Peanut_Butter_Oat_Crunch_1445d28e-ca9a-49a3-9f39-f0bda3e37a0f_large.jpg",
        "title":"Peanut Butter Oat Crunch",
        "id":"32636113453103",
        "recharge_id":"32636113453103",
        "qty":"2",
        "weight":"75"
      },
      {
        "image":"https://cdn.shopify.com/s/files/1/2528/8566/products/Fit_Fudge_Brownie_e9810874-d9e9-423e-ab50-5769d81936d4_large.jpg",
        "title":"FitFudge Brownie",
        "id":"32636111257647",
        "recharge_id":"32636111257647",
        "qty":"2",
        "weight":"75"
      }
    ]
   */

  try {
    const addons = await getAddonData(customerEmail, customerId);
    res.json(addons);
  } catch (error) {
    next(error);
  }
});

router.post("/update-addon", async (req, res, next) => {
  // TODO: Test for when you already have an addon in subscription and then "clearAddons"
  const { customerId, customerEmail, addOnProducts } = req.body;
  let addOnResult;

  try {
    if (addOnProducts && addOnProducts.length) {
      addOnResult = await createOrReplaceAddonData(
        addOnProducts,
        customerEmail,
        customerId
      );
    } else {
      addOnResult = await createOrReplaceAddonData(
        ["clearAddOns"],
        customerEmail,
        customerId
      );
    }

    console.log({ addOnResult });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/get-meal-plan", async (req, res, next) => {
  const { customerId, customerEmail } = req.body;

  /**
    {
      // Small, Medium, Large,
      mealSize: size,
      // 6, 8, 10, 12
      mealCount: count,
    }
   */

  try {
    const mealPlan = await getMealPlanData(customerEmail, customerId);
    res.json(mealPlan);
  } catch (error) {
    next(error);
  }
});

router.post("/update-meal-plan", async (req, res, next) => {
  const { customerId, customerEmail, mealSize, mealCount } = req.body;

  const mealPlan = {
    mealSize,
    mealCount,
  };

  try {
    const mealPlanResult = await createOrReplaceMealPlanData(
      mealPlan,
      customerEmail,
      customerId
    );

    console.log({ mealPlanResult });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

// Not used anymore when moved over to own API
router.post("/delete-all-metafields", async (req, res, next) => {
  const { customerId } = req.body;

  try {
    await deleteAllMetafields(customerId);
  } catch (error) {
    next(error);
  }
});

router.post("/reset-all-fields", async (req, res, next) => {
  const { customerId, customerEmail } = req.body;

  try {
    await resetAllCustomerFields(customerEmail, customerId);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// Current customers are being being put in INACTIVE, but there isn't anything to put them back. 
// TODO: Possibly put on "re-order" 
router.post("/reset-field-for-canceled-customers", async (req, res, next) => {
  const { customerId, customerEmail } = req.body;

  try {
    await resetFieldForCanceledCustomer(customerEmail, customerId);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

router.post("/does-customer-exist", async (req, res, next) => {
  const { email } = req.body;
  try {
    const isFoundCustomer = await doesCustomerExist(email);
    return res.send(isFoundCustomer);
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = router;
