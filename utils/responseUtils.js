
/**
 * Sends a Basic authentication challenge to an unindentified
 * user.
 *
 * @param {object} response - a http response
 *
 * @returns {object} sent response
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
 * @param {object} response - a http response
 * @param {string} payload - content
 * @param {number} code - status code
 */
const sendJson = (response, payload, code = 200) => {
  response.writeHead(code, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(payload));
};

/**
 * Sends JSON of a created resource with the method sendJson.
 *
 * @param {object} response - a http response
 * @param {string} payload - content
 *
 * @returns {object} sent response
 */
const createdResource = (response, payload) => {
  return sendJson(response, payload, 201);
};

/**
 * Response for situations when there is no need for visual update,
 * but the request succeeded.
 *
 * @param {object} response - a http response
 *
 * @returns {object} sent response
 */
const noContent = response => {
  response.statusCode = 204;
  return response.end();
};

/**
 * Responds to a bad request.
 *
 * @param {object} response - a http response
 * @param {string} errorMsg - an error message
 *
 * @returns {object} sent response
 */
const badRequest = (response, errorMsg) => {
  if (errorMsg) return sendJson(response, { error: errorMsg }, 400);

  response.statusCode = 400;
  return response.end();
};

/**
 * Responds to an unauthorized request.
 *
 * @param {object} response - a http response
 *
 * @returns {object} sent response
 */
const unauthorized = response => {
  response.statusCode = 401;
  return response.end();
};

/**
 * Responds to an unauthorized request.
 *
 * @param {object} response - a http response
 *
 * @returns {object} sent response
 */
const forbidden = response => {
  response.statusCode = 403;
  return response.end();
};

/**
 * Responds when the resourse requested is not found.
 *
 * @param {object} response - a http response
 *
 * @returns {object} sent response
 */
const notFound = response => {
  response.statusCode = 404;
  return response.end();
};

/**
 * Responds when the request method is not allowed.
 *
 * @param {object} response - a http response
 *
 * @returns {object} sent response
 */
const methodNotAllowed = response => {
  response.statusCode = 405;
  return response.end();
};

/**
 * Responds when the request Content-Type is not accepted.
 *
 * @param {object} response - a http response
 *
 * @returns {object} sent response
 */
const contentTypeNotAcceptable = response => {
  response.statusCode = 406;
  return response.end();
};

/**
 * Responds when a server error occurs.
 *
 * @param {object} response - a http response
 *
 * @returns {object} sent response
 */
const internalServerError = response => {
  response.statusCode = 500;
  return response.end();
};

/**
 * Responds when redirect is needed.
 *
 * @param {object} response - a http response
 * @param {string} page - a html page
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
