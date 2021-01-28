const buildAxiosQuery = require("../util/buildAxiosQuery");
/**
 * @summary  
 * @param   {String} shopifyOrderId Order Id
 * @param   {String} notes   Cart Notes
 * @returns {Promise<>}
 */

const updateCartNotes = async (shopifyOrderId, notes) => {
  try {
    const query = `
      mutation orderNotes ($input: OrderInput!){
        orderUpdate(input: $input) {
          order{
            updatedAt
            customer {
              id
            }
          }
        }
      }
      `;

    const variables = {
      input: {
        id: shopifyOrderId,
        note: notes,
      },
    };

    const response = await buildAxiosQuery(query, variables);
    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = updateCartNotes;
