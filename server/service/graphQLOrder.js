const buildAxiosQuery = require("../util/buildAxiosQuery");
/**
 * @summary  Get custom order query for lineItem tags and properties and customers
 * @param   {String} orderId Order Id
 * @returns {Promise<>}
 */

const getOrdersFromShopify = async (orderId) => {
  try {
    const query = `
        query orderById($ID: ID!) {
          order(id: $ID) {
            lineItems(first: 10) {
              edges {
                node {
                  customAttributes {
                    key
                    value
                  }
                  product {
                    id
                    tags
                  }
                }
              }
            }
            customer {
              id
              metafields(first: 20) {
                edges {
                  node {
                    id
                    key
                    value
                    namespace
                  }
                }
              }
            }
          }
        }
      `;

    const variables = {
      ID: `gid://shopify/Order/${orderId}`,
    };

    const response = await buildAxiosQuery(query, variables);
    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = getOrdersFromShopify;
