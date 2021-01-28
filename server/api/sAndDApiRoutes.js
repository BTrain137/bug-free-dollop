const express = require("express");
const router = express.Router();

const { getAddressDetailById } = require("../models/recharge/address");
const { getAllSAndD, removeSAndD } = require("../controller/sAndDController");
const {
  addSurpriseAndDelightToNextOrder,
} = require("../service/addOneTimeProduct");
const {
  updateNoteAttributeRecharge,
} = require("../service/updateNoteAttribute");
const getNextWeekDayOccurrence = require("../util/getNextWeekDayOccurrence");

// /api/s-and-d/all
router.get("/all", async (req, res, next) => {
  try {
    const allSurpriseAndDelights = await getAllSAndD();
    res.json(allSurpriseAndDelights);
  } catch (error) {
    next(error);
  }
});

router.post("/remove", async (req, res, next) => {
  const { addressId } = req.body;
  try {
    await removeSAndD(addressId);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/add", async (req, res, next) => {
  const { addressId, next_charge_scheduled_at, next_charge } = req.body;
  try {
    const { note_attributes } = await getAddressDetailById(addressId);
    let [orderSequence] = note_attributes.filter(
      (notes) => notes.name === "Order Sequence"
    );
    let [deliveryDate] = note_attributes.filter(
      (notes) => notes.name === "Delivery Date"
    );

    if (!orderSequence) {
      orderSequence = {
        name: "Order Sequence",
        value: "1",
      };
      const newNotes = {};
      note_attributes.push({
        name: "Order Sequence",
        value: "1",
      });
      await updateNoteAttributeRecharge(addressId, note_attributes, newNotes);
    }

    let nextDeliveryDay;
    if (deliveryDate.value) {
      const [month, day, year] = deliveryDate.value.split("/");
      nextDeliveryDay = `${year}-${month}-${day}`;
    } else {
      nextDeliveryDay = new Date();
    }

    const nextChargeDate =
      next_charge_scheduled_at ||
      getNextWeekDayOccurrence(nextDeliveryDay, "Wednesday");

    let sequenceChecked = 0;
    if(next_charge) sequenceChecked = orderSequence.value + 1;
    else sequenceChecked = orderSequence.value;

    await addSurpriseAndDelightToNextOrder(
      sequenceChecked,
      addressId,
      nextChargeDate
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
