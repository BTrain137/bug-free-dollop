const express = require("express");
const router = express.Router();

const shopifyApiRoutes = require("./shopifyApiRoutes");
const rechargeApiRoutes = require("./rechargeApiRoutes");
const storeApiRoutes = require("./storeApiRoutes");
const mealsApiRoutes = require("./mealsApiRoutes");
const sAndDApiRoutes = require("./sAndDApiRoutes");
const ordersApiRoutes = require("./ordersApiRoutes");
const clientStatesApiRoutes = require("./clientStatesApiRoutes");

// TODO: Append store in the url
router.use("/", storeApiRoutes);
router.use("/shopify", shopifyApiRoutes);
router.use("/recharge", rechargeApiRoutes);
router.use("/meals", mealsApiRoutes);
router.use("/s-and-d", sAndDApiRoutes);
router.use("/orders", ordersApiRoutes);
router.use("/client-stats", clientStatesApiRoutes);

module.exports = router;
