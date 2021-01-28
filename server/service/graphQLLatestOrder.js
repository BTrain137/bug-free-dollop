const buildAxiosQuery = require("../util/buildAxiosQuery");
/**
 * @summary  
 * @param   {String} customerId Customer Id
 * @returns {Promise<>}
 */

const getLastOrderByCustomer = async (customerId) => {
  try {
    const query = `
      query customerByID ($ID: ID!){
        customer(id: $ID) {
          displayName
          lastOrder {
            id
          }
          orders(first: 1, reverse: true) {
            edges {
              node {
                id
                name
                createdAt
              }
            }
          }
        }
      }
      `;

    const variables = {
      ID: `gid://shopify/Customer/${customerId}`,
    };

    const response = await buildAxiosQuery(query, variables);
    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = getLastOrderByCustomer;
