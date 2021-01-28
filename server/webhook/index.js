const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const shopifyWebhookRoutes = require("./shopifyWebhookRoutes");
const getThisWeekDayOccurrence = require("../util/getThisWeekDayOccurrence");
const { setNextChargeDateBulk } = require("../service/Recharge");
const getOrdersByIdShopify = require("../service/restShopifyOrders");
const { createOrUpdateDayMetafield } = require("../service/dayMetafield");
const {
  processFirstOrder,
  processRecurringOrder,
} = require("../service/processOrders");
const { SECRET } = process.env;

// Validate the webhook from shopify
const validateWebhook = (req, res, next) => {
  const { rawbody } = req;
  const hmacHeader = req.get("X-Shopify-Hmac-Sha256");

  if (!hmacHeader || !rawbody) {
    return false;
  }

  const hmac = crypto
    .createHmac("sha256", SECRET)
    .update(rawbody, "utf8", "hex")
    .digest("base64");

  let valid = true;
  hmacHeader.split("").forEach((element, index) => {
    if (element !== hmac[index]) {
      valid = false;
    }
  });

  if (valid) {
    next();
  } else {
    res.sendStatus(403);
  }
};

router.get(
  "/",
  // validateWebhook,
  async (req, res) => {
    res.status(200).send("Worked!");
  }
);

router.post(
  "/",
  // validateWebhook,
  async (req, res) => {
    const str = JSON.stringify(req.body);
    console.log(str);
    res.sendStatus(200);
  }
);

router.use("/shopify", shopifyWebhookRoutes);

// This will trigger X days before the upcoming charge is scheduled.
// The default is 3 days but your store specific setting can be verified on the Notification Settings page in the description of the Upcoming charge customer notification.
router.post(
  "/recharge/charge/upcoming",
  // validateWebhook,
  async (req, res) => {
    const str = JSON.stringify(req.body);
    console.log(str);
    res.sendStatus(200);
  }
);

// This will trigger when your customers checkout successfully (only on the UI checkout success).
router.post(
  "/recharge/charge/created",
  // validateWebhook,
  async (req, res) => {
    const str = JSON.stringify(req.body);
    console.log("============== /recharge/charge/created ================");
    console.log(str);
    console.log("============== /recharge/charge/created ================");

    const {
      tags: orderTags,
      note_attributes,
      line_items,
      address_id,
      customer_id,
    } = req.body.charge;

    // Determine if customer created order or recharge charges the next order
    let isFirstOrder;
    if (orderTags.includes("Subscription First Order")) {
      isFirstOrder = true;
    }
    else if (orderTags.includes("Subscription Recurring Order")) {
      isFirstOrder = false;
    }

    let deliveryDate, deliveryDay;
    note_attributes.forEach((note) => {
      const { name, value } = note;
      if (name === "Delivery Date") {
        deliveryDate = value;
      } else if (name === "Delivery Day") {
        deliveryDay = value;
      }
    });

    const chargeDate = getThisWeekDayOccurrence(deliveryDate, "Wednesday");

    if (isFirstOrder) {
      const body = { subscriptions: [] };
      line_items.forEach((item) => {
        const { subscription_id } = item;
        body.subscriptions.push({
          id: subscription_id,
          next_charge_scheduled_at: chargeDate,
        });
      });

      const dayMetafieldObj = {
        address_id,
        deliveryDay,
      };

      try {
        const dateMetaResult = await setNextChargeDateBulk(address_id, body);
        const dayMetaResult = await createOrUpdateDayMetafield(
          dayMetafieldObj,
          customer_id
        );
        console.log(dayMetaResult, dateMetaResult);
        res.sendStatus(200);
      } catch (error) {
        console.log("error", error.response.status);
        console.log("error", error.response.statusText);
        res.sendStatus(error.response.status);
      }
    }
  }
);

// This will trigger when an order is created
// both when the customer executes the order and also when recharge executes a recurring order
// /webhooks/recharge/order/created
// TODO: Must do shopify create route
router.post(
  "/recharge/order/created",
  // validateWebhook,
  async (req, res) => {
    // const str = JSON.stringify(req.body);
    const {
      tags: orderTags,
      id,
      address_id,
      shopify_order_id,
      shopify_order_number,
      customer,
      customer_id,
    } = req.body.order;

    console.log(
      "============== START /recharge/order/created ================"
    );
    console.log({ order_id: id });
    console.log({ address_id });
    console.log({ shopify_order_id });
    console.log({ shopify_order_number });
    console.log({ customer_id });
    console.log({ email: customer.email });
    console.log(
      "--------------------------------------------------------------"
    );

    try {
      // Determine if customer created order or recharge charges the next order
      if (orderTags.includes("Subscription First Order")) {
        await processFirstOrder(req.body.order);
      }
      // "tags": "Subscription, Subscription Recurring Order",
      else if (orderTags.includes("Subscription Recurring Order")) {
        await processRecurringOrder(req.body.order);
      }
    } catch (error) {
      // TODO: Log error to database and log order to rerun
      console.log("Error: /recharge/order/created");
    }

    res.sendStatus(200);
  }
);

// This will trigger when you create a subscription via API or when you go through the checkout on UI.
router.post(
  "/recharge/subscription/created",
  // validateWebhook,
  async (req, res) => {
    const str = JSON.stringify(req.body);
    console.log(
      "============== /recharge/subscription/created ================"
    );
    console.log(str);
    console.log(
      "============== /recharge/subscription/created ================"
    );
    res.sendStatus(200);
  }
);

// purchase/thanks
router.get("/recharge/checkout/link", async (req, res) => {
  const { orderId } = req.query;
  try {
    const order = await getOrdersByIdShopify(orderId);
    res.json({ url: order.order_status_url });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;
