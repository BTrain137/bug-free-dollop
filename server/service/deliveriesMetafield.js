const lzString = require("lz-string");
const {
  getDeliveriesMetafield,
  createDeliveriesMetafield,
  updateDeliveriesMetaField,
} = require("../util/rechargeDeliveriesMetafield");

/**
 * @description Create Deliveries Recharge Metafields if doesn't exit
 * @param {{ Date:Number: Day:String }} newField   Value to be access later
 * @param {Number|String}                             customerId Valid customer ID associated with recharge
 */

module.exports.createOrUpdateDeliveriesMetafield = (newField, customerId) => {
  return new Promise(async (resolve, reject) => {
    let result;

    try {
      const deliveriesMetafield = await getDeliveriesMetafield(customerId);

      if(deliveriesMetafield) {
        const date = Object.keys(newField)[0];
        if(deliveriesMetafield.hasOwnProperty("value")) {
          let metafield;
          try {
            const decompress = lzString.decompressFromUTF16(deliveriesMetafield.value);
            metafield = JSON.parse(decompress);
          } catch (error) { 
            metafield = JSON.parse(deliveriesMetafield.value);
          }
          metafield[date] = newField[date];
          const compressed = lzString.compressToUTF16(JSON.stringify(metafield));
          result = await updateDeliveriesMetaField(deliveriesMetafield.id, compressed, customerId);
        }
      }
      else {
        const compressed = lzString.compressToUTF16(JSON.stringify(newField));
        result = await createDeliveriesMetafield(compressed, customerId);
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * @description Create Deliveries Recharge Metafields if doesn't exit
 * @param {{ Date:Number: Day:String }} newField   Value to be access later
 * @param {Number|String}               customerId Valid customer ID associated with recharge
 */

module.exports.createOrReplaceDeliveriesMetafield = (newField, customerId) => {
  return new Promise(async (resolve, reject) => {
    let result;

    try {
      const deliveriesMetafield = await getDeliveriesMetafield(customerId);
      const compressed = lzString.compressToUTF16(JSON.stringify(newField));

      if(deliveriesMetafield) {
        if(deliveriesMetafield.hasOwnProperty("value")) {
          result = await updateDeliveriesMetaField(deliveriesMetafield.id, compressed, customerId);
        }
      }
      else {
        result = await createDeliveriesMetafield(compressed, customerId);
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
