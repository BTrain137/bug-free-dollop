const axios = require("axios");
const Recharge = require("recharge-api-node");

const {
  RECHARGE_ACCESS_TOKEN,
  RECHARGE_API_KEY,
  RECHARGE_SECRETE,
  NAMESPACE_ID,
} = process.env;

const recharge = new Recharge({
  apiKey: RECHARGE_API_KEY,
  secrete: RECHARGE_SECRETE,
});

/**
 * @description Retrieve metafield by key
 * @param {String}        key        Key used to locate metafield
 * @param {Number|String} customerId Valid customer ID associated with recharge
 */

module.exports.getMetafield = (metaFieldKey, customerId) => {
  return new Promise((resolve, reject) => {
    recharge.metafield
      .list({
        owner_resource: "customer",
        owner_id: customerId,
        namespace: NAMESPACE_ID,
      })
      .then((metafields) => {
        const [metafield] = metafields.filter(
          ({ key }) => key === metaFieldKey
        );
        resolve(metafield);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * @description Create Recharge Metafields
 * @param {Object}        metafieldId   Existing metafield containing id
 * @param {Number|String} customerId    Valid customer ID associated with recharge
 * @param {Object|String} updatedFields Value to be access later
 * @param {String}        valueType    What is the metafield used for
 * @param {String}        desc          What is the metafield used for
 */

module.exports.updateMetaField = (
  metafieldId,
  customerId,
  updatedFields,
  valueType,
  desc,
) => {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "X-Recharge-Access-Token": RECHARGE_ACCESS_TOKEN,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    axios
      .put(
        "https://api.rechargeapps.com/metafields/" + metafieldId,
        {
          metafield: {
            owner_id: customerId.toString(),
            value: updatedFields,
            owner_resource: "customer",
            value_type: valueType,
            description: desc,
          },
        },
        options
      )
      .then(function (response) {
        console.log(response.statusText);
        resolve(response.status);
      })
      .catch(function (error) {
        console.log(updatedFields);
        console.log(error.statusText);
        reject(error);
      });
  });
};

/**
 * @description Create Recharge Metafields
 * @param {String}        desc       Description of metafield
 * @param {Object|String} newField   Value to be access later
 * @param {String}        valueType  Type of the metafield, 'json_string', 'string', 'number'
 * @param {String}        key        Key used to locate metafield
 * @param {Number|String} customerId Valid customer ID associated with recharge
 */

module.exports.createMetafield = (
  desc,
  newField,
  valueType,
  key,
  customerId,
) => {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "X-Recharge-Access-Token": RECHARGE_ACCESS_TOKEN,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };


    axios
      .post(
        "https://api.rechargeapps.com/metafields/",
        {
          metafield: {
            description: desc,
            namespace: NAMESPACE_ID,
            value: newField,
            value_type: valueType,
            key: key,
            owner_resource: "customer",
            owner_id: customerId.toString(),
          },
        },
        options
      )
      .then(function (response) {
        console.log(response.statusText);
        resolve(response.status);
      })
      .catch(function (error) {
        console.log(error.message);
        if(error.response.status === 422) {
          resolve("OK");
        }
        else {
          reject(error);
        }
      });
  });
};
