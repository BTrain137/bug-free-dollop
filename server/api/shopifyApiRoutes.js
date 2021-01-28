const express = require("express");
const router = express.Router();

const latestOrderFromCustomer = require("../service/graphQLLatestOrder");
const graphQLUpdateCartNotes = require("../service/graphQLUpdateCartNotes");

router.post("/update-cart-notes", async (req, res) => {
  const { shopifyCustomerId, cartNotes } = req.body;
  try {
    const { customer } = await latestOrderFromCustomer(shopifyCustomerId);
    await graphQLUpdateCartNotes(customer.orders.edges[0].node.id, cartNotes); 
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
