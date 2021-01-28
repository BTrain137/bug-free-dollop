const buildAxiosQuery = require("../util/buildAxiosQuery");
/**
 * @summary
 * @param   {String} title "6 Meals: Large"
 * @returns {Promise<>}
 */

const getProductByTitle = async (title) => {
  try {
    const query = `
      query getProductByTitle($title: String!) {
        products(query: $title, first: 5) {
          edges {
            node {
              id
              title
              handle
              tags
              variants (first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
      `;

    const variables = {
      title: `title:${title} AND tag:Subscription`,
    };

    const response = await buildAxiosQuery(query, variables);
    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = getProductByTitle;
