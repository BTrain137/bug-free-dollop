/**
 * Extra Subscription Properties that is needed
 *
 * @param   {Array} customAttributes Shopify line item properties 
 * @returns {{startDate:String, frequency:String}} Recharge properties needed to build metafield
 */

const extractSubscriptionProperties = (customAttributes) => {
  const result = {};
  customAttributes.forEach(({ key, value }) => {
    if (key === "Start Date") {
      result.startDate = value;
    } else if (key === "charge_interval_frequency") {
      result.frequency = value;
    }
  });
  return result;
};

module.exports = extractSubscriptionProperties;
