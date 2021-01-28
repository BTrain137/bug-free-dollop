const buildAxiosQuery = require("../../util/buildAxiosQuery");
/**
 * @summary
 * @param   {String} orderName Order Name #112765
 * @returns {Promise<>}
 */

module.exports.getShopifyOrderIdWithOrderName = async (orderName) => {
  try {
    const query = `
      query getShopifyOrderIdWithOrderName($query: String!) {
        orders(first: 5, query: $query) {
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              id
            }
          }
        }
      }
      `;

    const variables = {
      query: `name:${
        orderName.toString().includes("#") ? orderName : `#${orderName}`
      }`,
    };

    const response = await buildAxiosQuery(query, variables);
    return response;
  } catch (error) {
    throw error;
  }
};
