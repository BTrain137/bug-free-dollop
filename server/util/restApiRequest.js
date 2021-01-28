const request = require("request");

/**
 * Get request to shopify
 *
 * @param   {Object} option          The request object for shopify
 * @param   {String} option.url      The url of endpoint
 * @param   {String} option.headers  Header containing access token "X-Shopify-Access-Token"
 * @param   {String} option.method   HTTP request GET POST DELETE PUT
 * @param   {Number} timeOut Time before the next execution can start
 * @returns {Promise}        Promise object represents the post body
 */

module.exports.restApiRequest = function (option, timeOut = 250) {
  return new Promise(function (resolve, reject) {
    option.json = true;
    request(option, function (err, res, body) {
      if (err) {
        reject(err);
      }
      if (res && res.statusCode >= 400) {
        console.log(res.statusCode, res.statusMessage);
        reject(res.statusMessage);
      }
      // TODO: What 300? possibly not correct
      else if (res && res.statusCode >= 300) {
        console.log(res.statusCode, res.statusMessage);
        reject(body);
      }

      if (body && body.hasOwnProperty("error")) {
        reject(body);
      } else {
        setTimeout(() => {
          resolve(body);
        }, timeOut);
      }
    });
  });
};

/**
 * Get request to shopify
 *
 * @param   {Object} option          The request object for shopify
 * @param   {String} option.url      The url of endpoint
 * @param   {String} option.headers  Header containing access token "X-Shopify-Access-Token"
 * @param   {String} option.method   HTTP request GET POST DELETE PUT
 * @param   {Number} timeOut Time before the next execution can start
 * @returns {Promise<{ body:Object, res:Object }>}     Promise object represents the post body and the response object
 */

module.exports.restApiRequestWithHeader = function (option, timeOut = 250) {
  return new Promise(function (resolve, reject) {
    option.json = true;
    request(option, function (err, res, body) {
      if (err) {
        reject(err);
      }
      if (res && res.statusCode >= 400) {
        console.log(res.statusCode, res.statusMessage);
        reject(res.statusMessage);
      }
      // TODO: What 300? possibly not correct
      else if (res && res.statusCode >= 300) {
        console.log(res.statusCode, res.statusMessage);
        reject(body);
      }

      if (body && body.hasOwnProperty("error")) {
        reject(body);
      } else {
        setTimeout(() => {
          resolve({ body, res });
        }, timeOut);
      }
    });
  });
};
