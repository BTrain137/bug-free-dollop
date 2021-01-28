const express = require("express");
const { processShopifyOrder } = require("../service/processOrders");
const router = express.Router();

// /webhooks/shopify/order/creation
router.post("/order/creation", async (req, res, next) => {
  const { id, email, name, customer, tags: orderTags } = req.body;
  try {
    if(!email || !name || !customer) {
      console.log("Test Orders???", req.body);
      return res.sendStatus(200);
    }

    console.log("============== START /shopify/order/created ================");
    console.log({ id });
    console.log({ name });
    console.log({ customerId: customer.id });
    console.log({ email });
    console.log("==============================");

    if (orderTags.includes("Subscription,")) {
      console.log("Is Recharge Order Clean Exit");
      console.log("============== END /shopify/order/created ================");
    } else {
      await processShopifyOrder(req.body);
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
