const express = require("express");
const {
  updateAllSubscriptions,
  updateCustomersWidthWeeklyDeliveries,
  updateCustomerByEmail,
  replaceCustomerMenuItems,
  updateLeftOverMealsForThisWeek,
} = require("../controller/customerController");
const {
  moveChargeDateForUpcomingSkipped,
  areAllUpcomingDeliveryGood,
} = require("../controller/mealController");
const { addSAndDForAllCustomers } = require("../controller/sAndDController");
const router = express.Router();

// /api/meals/swap-all-meals
// Only processes customers who have made updates
router.get("/swap-all-meals", async (req, res, next) => {
  try {
    await updateAllSubscriptions();
    res.json({});
  } catch (error) {
    next(error);
  }
});

// /api/meals/swap-all-meals
// This cron goes through all the customers and processes them.
// The other function only processes customers who have made updates.
router.get("/swap-all-meals-long", async (req, res, next) => {
  try {
    await updateCustomersWidthWeeklyDeliveries();
    res.json({});
  } catch (error) {
    next(error);
  }
});

router.get("/add-sweat-and-delight-order", (req, res, next) => {
  try {
    process.nextTick(() => {
      addSAndDForAllCustomers();
    });
    res.json({});
  } catch (error) {
    next(error);
  }
});

router.get("/move-charge-date-for-skipped-week", (req, res, next) => {
  try {
    process.nextTick(() => {
      moveChargeDateForUpcomingSkipped();
    });
    res.json({});
  } catch (error) {
    next(error);
  }
});

router.post("/update-one-customer-by-email", async (req, res, next) => {
  const { customerEmail } = req.body;
  try {
    const result = await updateCustomerByEmail(customerEmail);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

router.post("/replace-menu-items", async (req, res, next) => {
  const { originalProductId, originalVariantId, newProductId, newVariantId } = req.body;

  const originalItem = {
    productId: originalProductId,
    variantId: originalVariantId,
  };

  const newItem = {
    productId: newProductId,
    variantId: newVariantId,
  }

  try {
    const result = await replaceCustomerMenuItems(
      originalItem,
      newItem
    );
    res.send(result);
  } catch (error) {
    next(error);
  }
});

router.post("/replace-menu-items-with-url", async (req, res, next) => {
  const { originalProductUrl, newProductUrl } = req.body;

  const originalProductUrlSplit = originalProductUrl.split("/");
  const newProductUrlSplit = newProductUrl.split("/");

  const originalItem = {
    productId: originalProductUrlSplit[5],
    variantId: originalProductUrlSplit[7],
  };

  const newItem = {
    productId: newProductUrlSplit[5],
    variantId: newProductUrlSplit[7],
  }

  try {
    const result = await replaceCustomerMenuItems(
      originalItem,
      newItem
    );
    res.send(result);
  } catch (error) {
    next(error);
  }
});

router.get("/execute-left-over-meals-for-this-week", async (req, res, next) => {
  try {
    process.nextTick(() => {
      updateLeftOverMealsForThisWeek();
    });
    res.send({});
  } catch (error) {
    next(error);
  }
});

// TODO: complete this. Untested and unproven
router.get("/are-all-meals-correct", (req, res, next) => {
  try {
    process.nextTick(() => {
      areAllUpcomingDeliveryGood();
    });
    res.json({});
  } catch (error) {
    next(error);
  }
});


module.exports = router;
