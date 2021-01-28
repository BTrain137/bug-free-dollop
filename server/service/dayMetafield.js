const {
  getDayMetafield,
  createDayMetafield,
  updateDayMetaField,
} = require("../util/rechargeDayMetafield");

/**
 * @description Create Day Recharge Metafields if doesn't exit
 * @param {{ Date:Number: Day:String }} newField   Value to be access later
 * @param {Number|String}               customerId Valid customer ID associated with recharge
 */

module.exports.createOrUpdateDayMetafield = (newField, customerId) => {
  return new Promise(async (resolve, reject) => {
    let result;

    try {
      const dayMetafield = await getDayMetafield(customerId);
      
      if(dayMetafield) {
        const date = Object.keys(newField)[0];
        if(dayMetafield.hasOwnProperty("value")) {
          const metafield = JSON.parse(dayMetafield.value);
          metafield[date] = newField[date];
          result = await updateDayMetaField(dayMetafield.id, metafield, customerId);
        }
      }
      else {
        result = await createDayMetafield(newField, customerId);
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports.createOrReplaceDayMetafield = (newField, customerId) => {
  return new Promise(async (resolve, reject) => {
    let result;

    try {
      const dayMetafield = await getDayMetafield(customerId);
      
      if(dayMetafield) {
        if(dayMetafield.hasOwnProperty("value")) {
          result = await updateDayMetaField(dayMetafield.id, newField, customerId);
        }
      }
      else {
        result = await createDayMetafield(newField, customerId);
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
