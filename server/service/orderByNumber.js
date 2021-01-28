const buildAxiosQuery = require("../util/buildAxiosQuery");

// order_status_ur
/**
 * @summary  Get custom order query for lineItem tags and properties and customers
 * @param   {String} orderId Order Id
 * @returns {Promise<>}
 */

const getOrdersFromShopify = async (email) => {
  try {
    const query = `
      query customerByEmailForLastOrderId{
        customers(first: 10, query:"email:'${email}'") {
          edges {
            node {
              lastOrder {
              id
              }
            }
          }
        }
      }
      `;

    const response = await buildAxiosQuery(query);
    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = getOrdersFromShopify;
