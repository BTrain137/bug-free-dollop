/**
 * @description  Return clean id from shopify's GID
 * @param  {String} gid Input string
 * @return {Number} ID
 * @example
 * cleanIDGraphql("gid://shopify/Order/2201702137922")
 * // 2201702137922
 */
module.exports.cleanIDGraphql = (gid) => {
  const splitString = gid.split("/");
  return parseInt(splitString[splitString.length - 1], 10);
};

// '<https://api.rechargeapps.com/charges?page_info=eyJkYXRlIjogIjIwMjAtMTItMDkiLCAic3RhdHVzIjogIlFVRVVFRCIsICJzdGFydGluZ19hZnRlcl9pZCI6IDMxMjMxMjc3OCwgImxhc3RfdmFsdWUiOiAzMTIzMTI3NzgsICJvcmRlcl9ieSI6ICJpZC1hc2MiLCAiY3Vyc29yX2RpciI6ICJuZXh0In0=&limit=50>; rel="next"'
module.exports.cleanLinkHeader = (linkStr, type) => {
  const linksArr = linkStr.split(",");
  const [link] = linksArr.filter((link) => link.includes(type));
  if(!link) {
    return false;
  }
  const url = link.split(";")[0];
  return url.replace("<", "").replace(">", "");
};
