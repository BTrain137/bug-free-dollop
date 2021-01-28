const express = require("express");
const { logErrors } = require("../models/errorLogs");
const { generalLog } = require("../models/generalLogs");
const router = express.Router();

// /api/add
router.post("/update-attribute-valid", async (req, res, next) => {
  const { attributes, store, delivery_flow, response, data } = req.body;
  try {
    await generalLog({
      route: "update-attribute-valid",
      function_name: "updateAttribute",
      notes: "Date Invalid Debugging",
      json_data: { attributes, store, data, delivery_flow, response },
    });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/update-attribute-invalid", async (req, res, next) => {
  const { attributes, store, delivery_flow, response, data } = req.body;
  try {
    await logErrors({
      route: "update-attribute-invalid",
      function_name: "updateAttribute",
      notes: "Date Invalid Debugging",
      json_data: { attributes, store, data, delivery_flow, response },
    });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
