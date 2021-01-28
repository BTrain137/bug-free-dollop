const pool = require("../database/connection");
const Recharge = require("recharge-api-node");

const {
  RECHARGE_API_KEY,
  RECHARGE_SECRETE,
  RECHARGE_ACCESS_TOKEN,
} = process.env;

const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_SECRETE,
});

const hasOrderContainOneTime = (addressId, shopify_variant_id) => {
  return new Promise((resolve, reject) => {
    try {
      recharge.oneTime
        .list({
          address_id: addressId,
        })
        .then((oneTimes) => {
          const result = oneTimes.some(
            (oneTimes) => oneTimes.shopify_variant_id == shopify_variant_id
          );
          resolve(result);
        });
    } catch (error) {
      reject(error);
    }
  });
};

const getSurpriseAndDelightBySequenceNumber = async (sequence) => {
  try {
    const promisePool = pool.promise();
    const query =
      "SELECT * FROM `surprise_and_delight` WHERE `order_number` = ?";

    const [row] = await promisePool.query(query, [sequence]);
    if (row.length) {
      return row[0];
    } else {
      return false;
    }
  } catch (error) {
    throw error;
  }
};

const addOneTimeToNextOrder = (addressId, nextChargeDate, oneTimeProduct) => {
  return new Promise((resolve, reject) => {
    recharge.oneTime
      .create(addressId, {
        next_charge_scheduled_at: nextChargeDate,
        product_title: `${oneTimeProduct.item_title}`,
        quantity: 1,
        shopify_variant_id: oneTimeProduct.variant_id,
      })
      .then((success) => {
        console.log("addOneTimeToNextOrder: ", oneTimeProduct.item_title);
        resolve(success);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports.addSurpriseAndDelightToNextOrder = async (
  sequence,
  addressId,
  nextChargeDate
) => {
  try {
    const oneTimeProduct = await getSurpriseAndDelightBySequenceNumber(
      sequence
    );
    console.log("addSurpriseAndDelightToNextOrder");
    console.log({ sequence });
    console.log({ oneTimeProduct: JSON.stringify(oneTimeProduct) });
    if (oneTimeProduct) {
      const hasAlreadyBeenAdded = await hasOrderContainOneTime(addressId, oneTimeProduct.variant_id);
      console.log({ hasAlreadyBeenAdded });
      if(!hasAlreadyBeenAdded) {
        await addOneTimeToNextOrder(addressId, nextChargeDate, oneTimeProduct);
      }
    }
    return "ok";
  } catch (error) {
    throw error;
  }
};

module.exports.removeOneTime = (oneTimeId) => {
  return new Promise((resolve, reject) => {
    recharge.oneTime
      .delete(oneTimeId)
      .then((success) => resolve(success))
      .catch((error) => reject(error));
  });
};

module.exports.listOneTimes = (addressId) => {
  return new Promise((resolve, reject) => {
    try {
      recharge.oneTime
        .list({
          address_id: addressId,
        })
        .then((oneTimes) => {
          resolve(oneTimes);
        });
    } catch (error) {
      reject(error);
    }
  });
};
