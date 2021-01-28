/**
 * Return clean id from shopify's GID
 * @param  {String} gid gid://shopify/Metafield/13097482813486
 * @return {Number}     Only the number at the end
 * @example 
 * cleanIDGraphql("gid://shopify/Metafield/13097482813486")
 * // 13097482813486
 */
module.exports = function(gid) {
  const splitString = gid.split("/");
  return parseInt(splitString[splitString.length - 1]);
}
