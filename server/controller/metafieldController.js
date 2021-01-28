const Recharge = require("recharge-api-node");
const lzString = require("lz-string");

const { RECHARGE_API_KEY, RECHARGE_SECRETE, NAMESPACE_ID } = process.env;

const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_SECRETE,
});

module.exports.getDayMetafield = (customerId) => {
  return new Promise((resolve, reject) => {
    recharge.metafield
      .list({
        owner_resource: "customer",
        owner_id: customerId,
        namespace: NAMESPACE_ID,
      })
      .then((metafields) => {
        const [metafield] = metafields.filter(({ key }) => {
          return key === "weeklyDeliveryDay";
        });

        if (metafield && metafield.hasOwnProperty("value")) {
          return resolve(JSON.parse(metafield.value));
        } else {
          // possibly create on load? not sure.
        }
        resolve({});
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

module.exports.getWeeklyDeliveries = (customerId) => {
  return new Promise((resolve, reject) => {
    recharge.metafield
      .list({
        owner_resource: "customer",
        owner_id: customerId,
        namespace: NAMESPACE_ID,
      })
      .then((metafields) => {
        const [metafield] = metafields.filter(({ key }) => {
          return key === "weeklyDeliveries";
        });

        if (metafield && metafield.hasOwnProperty("value")) {
          let deliveriesMetafield;
          try {
            const decompress = lzString.decompressFromUTF16(metafield.value);
            deliveriesMetafield = JSON.parse(decompress);
          } catch (error) {
            deliveriesMetafield = JSON.parse(metafield.value);
          }
          return resolve(deliveriesMetafield);
        } else {
          resolve({});
        }
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

module.exports.deleteAllMetafields = function (customerId) {
  return new Promise((resolve, reject) => {
    recharge.metafield
      .list({
        owner_resource: "customer",
        owner_id: customerId,
        namespace: NAMESPACE_ID,
      })
      .then(async (metafields) => {
        for (let i = 0; i < metafields.length; i++) {
          const metafield = metafields[i];
          if (metafield.key !== "addOnProducts") {
            recharge.metafield
              .delete(metafield.id)
              .then((result) => {
                console.log(result, metafield.key);
              })
              .catch((error) => {
                console.log(error);
                next(error);
              });
          }
        }

        resolve("okay");
      })
      .catch((error) => reject(error));
  });
};
