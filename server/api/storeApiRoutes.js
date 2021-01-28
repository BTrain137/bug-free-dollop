const express = require("express");
const router = express.Router();

const {
  findStoreByZipCode,
  getAllStores,
  getAllZipcode,
} = require("../controller/storeController");

// TODO: Fix all routes to /store
// /api/store/find-store
router.get("/find-store", async (req, res, next) => {
  const { zipCode } = req.query;

  try {
    const storeInfo = await findStoreByZipCode(zipCode);
    res.json(storeInfo);
  } catch (error) {
    next(error);
  }
});

// /api/store/all
router.get("/store/all", async (req, res, next) => {

  try {
    const allStores = await getAllStores();
    res.json(allStores);
  } catch (error) {
    next(error);
  }
});

// /api/store/all
router.get("/zipcode/all", async (req, res, next) => {

  try {
    const allZipcode = await getAllZipcode();
    res.json(allZipcode);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
