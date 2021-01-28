const extractSubscriptionProperties = require("../util/extractSubscriptionProperties");
const calculateEndDate = require("../util/calculateEndDate");
const cleanIDGraphql = require("../util/cleanIDGraphql");

/**
 * @typedef {{
 *  namespace:String,
 *  key:String,
 *  value:String,
 *  value_type:String,
 * }} CreateMetafield
 *
 * @typedef {{
 *  id:Number,
 *  value:String,
 *  value_type:String,
 * }} UpdateMetafield
 *
 * @typedef {{
 *  edges: [{
 *    node: {
 *      customAttributes: [{
 *        key:String,
 *        value:String,
 *      }],
 *      product: {
 *        id:String,
 *        tags:String[],
 *      }
 *    }
 *  }]
 * }} LineItems
 *
 * @typedef {{
 *   id:String,
 *   metafields: {
 *     edges: [{
 *       node: {
 *         id:String;
 *         key:String,
 *         value:String,
 *         namespace:String,
 *       }
 *     }]
 *   }
 * }} Customer
 */

/**
 *
 * @param  {LineItems} lineItems    Graphql line items
 * @param  {Customer}  customer     Graphql customer object with id and tags only
 * @param  {String}    isFirstOrder When this order was created
 * @param  {String}    createAt     When this order was created
 * @return {Array<{metafield:UpdateMetafield || metafield:CreateMetafield}>}
 */

const buildMetaFields = (lineItems, customer, isFirstOrder, createdAt) => {
  const metafieldArr = [];
  const { edges: lineItemEdges } = lineItems;
  const {
    metafields: { edges: customerMetafieldsEdges },
  } = customer;

  for (let i = 0; i < lineItemEdges.length; i++) {
    const { node } = lineItemEdges[i];

    const {
      customAttributes,
      product: { tags },
    } = node;
    const [subscriptionTag] = tags.filter((tag) =>
      tag.includes("subscription-")
    );
    const subscriptionObj = extractSubscriptionProperties(customAttributes);

    const [_, subscriptionName] = subscriptionTag.split("-");

    ////// Start Date ///////
    const subscriptionStart = `start_date_${subscriptionName}`;
    const [filterSubNameStart] = customerMetafieldsEdges.filter(({ node }) => {
      const { key } = node;
      if (key === subscriptionStart) {
        return { ...node };
      }
    });

    if (filterSubNameStart) {
      // Update
      if (
        isFirstOrder &&
        filterSubNameStart.node.value !== subscriptionObj.startDate
      ) {
        metafieldArr.push({
          metafield: {
            id: cleanIDGraphql(filterSubNameStart.node.id),
            value: subscriptionObj.startDate,
            value_type: "string",
          },
        });
      }
    } else {
      // Create
      metafieldArr.push({
        metafield: {
          namespace: "digital_subscription",
          key: subscriptionStart,
          value: subscriptionObj.startDate,
          value_type: "string",
        },
      });
    }

    ////// End Date ///////
    // Find out if customer has already created this metafield
    // There should be only one uniquer end_date per subscription type;
    const subscriptionEnd = `end_date_${subscriptionName}`;
    const [filterSubNameEnd] = customerMetafieldsEdges.filter(({ node }) => {
      const { key } = node;
      if (key === subscriptionEnd) {
        return { ...node };
      }
    });

    if (filterSubNameEnd) {
      // Update metafield
      const endValue = isFirstOrder ? subscriptionObj.startDate : createdAt;
      const endDate = calculateEndDate(endValue, subscriptionObj.frequency);
      metafieldArr.push({
        metafield: {
          id: cleanIDGraphql(filterSubNameEnd.node.id),
          value: endDate,
          value_type: "string",
        },
      });
    } else {
      // Create new metafield
      metafieldArr.push({
        metafield: {
          namespace: "digital_subscription",
          key: subscriptionEnd,
          value: calculateEndDate(
            subscriptionObj.startDate,
            subscriptionObj.frequency
          ),
          value_type: "string",
        },
      });
    }
  }
  return metafieldArr;
};

module.exports = buildMetaFields;
