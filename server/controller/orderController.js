const { getAllUntaggedOrderErrors } = require("../models/orderModel");
const {
  getRechargeOrder,
  getGetRechargeOrderByShopifyId,
} = require("../models/recharge/orders");
const { getShopifyOrderIdWithOrderName } = require("../models/shopify/order");
const { processUntaggedOrders } = require("../service/orderHelpers");
const {
  processOrderForNotesAttribute,
  processOrderForNotesAttributeRecharge,
} = require("../service/processOrderForNotesAttribute");
const { processRecurringOrder } = require("../service/processOrders");
const { cleanIDGraphql } = require("../util/cleanData");

const getRechargeOrderFromShopifyName = async (orderName) => {
  const { orders: shopifyOrders } = await getShopifyOrderIdWithOrderName(
    orderName
  );
  const { edges } = shopifyOrders;
  const [edge] = edges;
  const {
    node: { id },
  } = edge;
  const shopifyOrderId = cleanIDGraphql(id);
  const rechargeOrders = await getGetRechargeOrderByShopifyId(shopifyOrderId);
  const [order] = rechargeOrders;
  return order;
};

module.exports.rerunOrdersFromRecharge = async (orderNumber) => {
  try {
    const order = await getRechargeOrder(orderNumber);
    await processRecurringOrder(order);
  } catch (error) {
    throw error;
  }
};

module.exports.rerunOrdersWithShopifyOrderNumber = async (orderName) => {
  try {
    const rechargeOrder = await getRechargeOrderFromShopifyName(orderName);
    await processRecurringOrder(rechargeOrder);
  } catch (error) {
    throw error;
  }
};

// For Recharge orders but updating shopify
module.exports.rerunOrdersWithShopifyOrderNumberForNotes = async (
  orderName,
  deliveryDay,
  deliveryDate,
  orderSequence
) => {
  try {
    const rechargeOrder = await getRechargeOrderFromShopifyName(orderName);
    await processOrderForNotesAttribute(
      rechargeOrder,
      deliveryDay,
      deliveryDate,
      orderSequence
    );
  } catch (error) {
    throw error;
  }
};

// For Recharge orders but updating Recharge 
module.exports.rerunOrdersWithShopifyOrderNumberForNotesRecharge = async (
  orderName,
  deliveryDay,
  deliveryDate,
  orderSequence
) => {
  try {
    const rechargeOrder = await getRechargeOrderFromShopifyName(orderName);
    await processOrderForNotesAttributeRecharge(
      rechargeOrder,
      deliveryDay,
      deliveryDate,
      orderSequence
    );
  } catch (error) {
    throw error;
  }
};

module.exports.rerunUntaggedOrders = async () => {
  try {
    const errorOrders = await getAllUntaggedOrderErrors();
    await processUntaggedOrders(errorOrders);
  } catch (error) {
    throw error;
  }
};
