
/**
 * Sends a Basic authentication challenge to an unindentified 
 * user.
 * 
 * @param {Object} response 
 */
const basicAuthChallenge = response => {
  // TODO: 8.4 Send proper basic authentication challenge headers
  //Responds with Basic authentication challenge:
  response.writeHead(401, {'WWW-Authenticate':'Basic'});
  return response.end();
};

/**
 * Sends JSON in response to client.
 * 
 * @param {Object} response 
 * @param {string} payload 
 * @param {number} code 
 */
const sendJson = (response, payload, code = 200) => {
  response.writeHead(code, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload));
};

/**
 * Sends JSON of a created resource with the method sendJson.
 * 
 * @param {Object} response 
 * @param {string} payload 
 */
const createdResource = (response, payload) => {
  return sendJson(response, payload, 201);
};

/**
 * Response for situations when there is no need for visual update, 
 * but the request succeeded.
 * 
 * @param {Object} response 
 */
const noContent = response => {
  response.statusCode = 204;
  return response.end();
};

/**
 * Responds to a bad request.
 * 
 * @param {Object} response 
 * @param {string} errorMsg 
 */
const badRequest = (response, errorMsg) => {
  if (errorMsg) return sendJson(response, { error: errorMsg }, 400);

  response.statusCode = 400;
  return response.end();
};

/**
 * Responds to an unauthorized request.
 * 
 * @param {Object} response 
 */
const unauthorized = response => {
  response.statusCode = 401;
  return response.end();
};

/**
 * Responds to an unauthorized request.
 * 
 * @param {Object} response 
 */
const forbidden = response => {
  response.statusCode = 403;
  return response.end();
};

/**
 * Responds when the resourse requested is not found.
 * 
 * @param {Object} response 
 */
const notFound = response => {
  response.statusCode = 404;
  return response.end();
};

/**
 * Responds when the request method is not allowed.
 * 
 * @param {Object} response 
 */
const methodNotAllowed = response => {
  response.statusCode = 405;
  return response.end();
};

/**
 * Responds when the request Content-Type is not accepted.
 * 
 * @param {Object} response 
 */
const contentTypeNotAcceptable = response => {
  response.statusCode = 406;
  return response.end();
};

/**
 * Responds when a server error occurs.
 * 
 * @param {Object} response 
 */

const internalServerError = response => {
  response.statusCode = 500;
  return response.end();
};

/**
 * Responds when redirect is needed.
 * 
 * @param {Object} response 
 * @param {string} page 
 */
const redirectToPage = (response, page) => {
  response.writeHead(302, { Location: page });
  response.end();
};

module.exports = {
  sendJson,
  createdResource,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  methodNotAllowed,
  contentTypeNotAcceptable,
  internalServerError,
  basicAuthChallenge,
  redirectToPage
};
