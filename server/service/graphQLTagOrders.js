const buildAxiosQuery = require("../util/buildAxiosQuery");
/**
 * @summary  Get custom order query for lineItem tags and properties and customers
 * @param   {String} orderId Order Id
 * @param   {String} tag     tag(s) that are comma separated if necessary
 * @returns {Promise<>}
 */

module.exports.tagOrderAdd = async (orderId, tag) => {
  try {
    const mutation = `
      mutation tagOrder($ID: ID!, $tags: [String!]!) {
        tagsAdd(id: $ID, tags: $tags) {
          userErrors {
            field
            message
          }
          node {
            id
          }
        }
      }
    `;

    const variables = {
      ID: `gid://shopify/Order/${orderId}`,
      tags: tag,
    };

    const response = await buildAxiosQuery(mutation, variables);
    if(response.tagsAdd.userErrors.length) {
      throw response.tagsAdd.userErrors[0].message;
    }
    else {
      console.log(`tagOrderAdd ${tag}`);
      return response;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * @summary  Get custom order query for lineItem tags and properties and customers
 * @param   {String}   orderId Order Id
 * @param   {String[]} tag     Array or tags
 * @returns {Promise<>}
 */
module.exports.tagOrderRemove = async (orderId, tag) => {
  try {
    const mutation = `
      mutation tagOrder($ID: ID!, $tags: [String!]!) {
        tagsRemove(id: $ID, tags: $tags) {
          userErrors {
            field
            message
          }
          node {
            id
          }
        }
      }
    `;

    const variables = {
      ID: `gid://shopify/Order/${orderId}`,
      tags: tag,
    };

    const response = await buildAxiosQuery(mutation, variables);
    if(response.tagsRemove.userErrors.length) {
      throw response.tagsAdd.userErrors[0].message;
    }
    else {
      console.log(`tagOrderRemove ${tag}`);
      return response;
    }
  } catch (error) {
    throw error;
  }
};

