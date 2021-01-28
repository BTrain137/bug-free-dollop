const express = require("express");
const {
  rerunOrdersFromRecharge,
  rerunOrdersWithShopifyOrderNumber,
  rerunOrdersWithShopifyOrderNumberForNotes,
  rerunUntaggedOrders,
  rerunOrdersWithShopifyOrderNumberForNotesRecharge,
} = require("../controller/orderController");
const router = express.Router();

router.post("/re-run", async (req, res) => {
  const { rechargeOrderNumber, shopifyOrderName } = req.body;
  try {
    if (rechargeOrderNumber) {
      await rerunOrdersFromRecharge(rechargeOrderNumber);
    } else if (shopifyOrderName) {
      await rerunOrdersWithShopifyOrderNumber(shopifyOrderName);
    }
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post("/re-run-for-notes-attribute", async (req, res) => {
  const { rechargeOrderNumber, shopifyOrderName } = req.body;
  try {
    if (rechargeOrderNumber) {
      await rerunOrdersFromRecharge(rechargeOrderNumber);
    } else if (shopifyOrderName) {
      await rerunOrdersWithShopifyOrderNumber(shopifyOrderName);
    }
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post("/re-run-shopify-notes-attribute", async (req, res) => {
  const { shopifyOrderName, deliveryDay, deliveryDate, orderSequence } = req.body;
  try {
    await rerunOrdersWithShopifyOrderNumberForNotes(
      shopifyOrderName,
      deliveryDay,
      deliveryDate,
      orderSequence
    );
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post("/re-run-recharge-notes-attribute", async (req, res) => {
  const { shopifyOrderName, deliveryDay, deliveryDate, orderSequence } = req.body;
  try {
    await rerunOrdersWithShopifyOrderNumberForNotesRecharge(
      shopifyOrderName,
      deliveryDay,
      deliveryDate,
      orderSequence
    );
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get("/re-run-untagged-orders", async (req, res) => {
  try {
    await rerunUntaggedOrders();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
