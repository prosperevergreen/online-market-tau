/* eslint-disable complexity */

const responseUtils = require("./utils/responseUtils");
const { acceptsJson, isJson, parseBodyJson } = require("./utils/requestUtils");
const { renderPublic } = require("./utils/render");
const auth = require("./auth/auth");
const {
	getAllProducts,
	createProduct,
	viewProduct,
	modifyProduct,
	deleteProduct,
} = require("./controllers/products");
const {
	getAllUsers,
	registerUser,
	deleteUser,
	viewUser,
	updateUser,
} = require("./controllers/users");
const {
	getAllOrders,
	getAllUserOrders,
	getAnyOrder,
	getOneOrder,
	createNewOrder,
} = require("./controllers/orders");
// Require user model
const User = require("./models/user");
const Product = require("./models/product");

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
	"/api/register": ["POST"],
	"/api/users": ["GET"],
	//Added routes for products and cart:
	"/api/products": ["GET", "POST"],
	"/api/cart": ["GET"],
	"/api/orders": ["GET", "POST"],

	"/api/users/{id}": ["GET", "PUT", "DELETE"],
	"/api/products/{id}": ["GET", "PUT", "DELETE"],
	"/api/orders/{id}": ["GET"],
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath - pathname of the request URL
 * @param {http.ServerResponse} response - response object
 *
 * @returns { http.ServerResponse } - reponses with 204 if path is allowed or 404 otherwise.
 */
const sendOptions = (filePath, response) => {
	if (filePath in allowedMethods) {
		response.writeHead(204, {
			"Access-Control-Allow-Methods": allowedMethods[filePath].join(","),
			"Access-Control-Allow-Headers": "Content-Type,Accept",
			"Access-Control-Max-Age": "86400",
			"Access-Control-Expose-Headers": "Content-Type,Accept",
		});
		return response.end();
	}

	return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url - filePath
 * @param {string} prefix - prefix of the path e.g for path /api/users/dsf7844e, prefix == users
 * @returns {boolean} - returns true if pattern matches otherwise false
 */
const matchIdRoute = (url, prefix) => {
	const idPattern = "[0-9a-z]{8,24}";
	const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
	return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url - filePath
 * @returns {boolean} - returns true if urls contains path to users id otherwise false
 */
const matchUserId = (url) => {
	return matchIdRoute(url, "users");
};

/**
 * Does the URL match /api/products/{id}
 *
 * @param {string} url - filePath
 * @returns {boolean} - returns true if urls contains path to users id otherwise false
 */
const matchProductId = (url) => {
	return matchIdRoute(url, "products");
};

/**
 * Does the URL match /api/orders/{id}
 *
 * @param {string} url - filePath
 * @returns {boolean} - returns true if urls contains path to orders id otherwise false
 */
const matchOrderId = (url) => {
	return matchIdRoute(url, "orders");
};

/**
 * Handles all app RESTfull requests calls
 *
 * @param { http.IncomingMessage } request - RESTful requests to server
 * @param { http.ServerResponse } response - response object to the request
 *
 * @returns { http.ServerResponse } - request response object
 */
const handleRequest = async (request, response) => {
	const { url, method, headers } = request;
	const filePath = new URL(url, `http://${headers.host}`).pathname;

	// serve static files from public/ and return immediately
	if (method.toUpperCase() === "GET" && !filePath.startsWith("/api")) {
		const fileName =
			filePath === "/" || filePath === "" ? "index.html" : filePath;
		return renderPublic(fileName, response);
	}

	// See: http://restcookbook.com/HTTP%20Methods/options/
	if (method.toUpperCase() === "OPTIONS") {
		return sendOptions(filePath, response);
	}
	if (
		matchUserId(filePath) ||
		matchOrderId(filePath) ||
		matchProductId(filePath)
	) {
		const pathBodyParts = filePath.split("/");
		pathBodyParts.pop();
		pathBodyParts.push("{id}");
		const idlessPath = pathBodyParts.join("/");

		// Default to 404 Not Found if unknown url
		if (!(idlessPath in allowedMethods))
			return responseUtils.notFound(response);

		// Check for allowable methods
		if (!allowedMethods[idlessPath].includes(method.toUpperCase())) {
			return responseUtils.methodNotAllowed(response);
		}
	} else {
		// Default to 404 Not Found if unknown url
		if (!(filePath in allowedMethods)) return responseUtils.notFound(response);

		// Check for allowable methods
		if (!allowedMethods[filePath].includes(method.toUpperCase())) {
			return responseUtils.methodNotAllowed(response);
		}
	}

	if (matchUserId(filePath)) {
		// TODO: 8.5 Implement view, update and delete a single user by ID (GET, PUT, DELETE)
		// You can use parseBodyJson(request) from utils/requestUtils.js to parse request body

		// Get current cred or respond with 401 error
		const currentUser = await auth.getCurrentUser(request);

		// Check user Authentication
		if (currentUser === null) {
			return responseUtils.basicAuthChallenge(response);
		}

		// Verify curent user is admin or respond with error 403
		if (currentUser.role !== "admin") {
			return responseUtils.forbidden(response);
		}

		const adminUser = currentUser;

		// Require a correct accept header (require 'application/json' or '*/*')
		if (!acceptsJson(request)) {
			return responseUtils.contentTypeNotAcceptable(response);
		}

		// Get user id from path
		const userId = filePath.split("/")[3];

		// GET - send user as response body
		if (method.toUpperCase() === "GET") {
			return viewUser(response, userId, adminUser);
		}

		// PUT - Modify user role and send modified user as response body
		if (method.toUpperCase() === "PUT") {
			// Get update info
			const update = await parseBodyJson(request);
			return updateUser(response, userId, adminUser, update);
		}

		// DELETE - Delete user by id and send deleted user as response body
		if (method.toUpperCase() === "DELETE") {
			return deleteUser(response, userId, adminUser);
		}
	}
	// view, update and delete a single product by ID (GET, PUT, DELETE)
	if (matchProductId(filePath)) {
		// TODO: 11.1 Implement
		// You can use parseBodyJson(request) from utils/requestUtils.js to parse request body

		// Get admin cred or responde with 401 error
		const currentUser = await auth.getCurrentUser(request);

		// Verify user cred or responde with 401 error
		if (currentUser === null) {
			return responseUtils.basicAuthChallenge(response);
		}

		// Get product Id from path
		const productId = filePath.split("/")[3];

		// Require a correct accept header (require 'application/json' or '*/*')
		if (!acceptsJson(request)) {
			return responseUtils.contentTypeNotAcceptable(response);
		}

		// GET - send user as response body
		if (method.toUpperCase() === "GET") {
			return viewProduct(response, productId);
		}

		// PUT - Modify user role and send modified user as response body
		if (method.toUpperCase() === "PUT") {
			// Get update info
			const productUpdate = await parseBodyJson(request);
			return modifyProduct(response, productId, productUpdate, currentUser);
		}

		// DELETE - Delete user by id and send deleted user as response body
		if (method.toUpperCase() === "DELETE") {
			return deleteProduct(response, productId, currentUser);
		}
	}

	if (matchOrderId(filePath)) {
		const orderId = filePath.split("/")[3];

		const currentUser = await auth.getCurrentUser(request);

		if (currentUser === null) {
			return responseUtils.basicAuthChallenge(response);
		}

		// Require a correct accept header (require 'application/json' or '*/*')
		if (!acceptsJson(request)) {
			return responseUtils.contentTypeNotAcceptable(response);
		}

		if (method.toUpperCase() === "GET") {
			if (currentUser.role === "admin") {
				return getAnyOrder(response, orderId);
			} else if (currentUser.role === "customer") {
				return getOneOrder(response, orderId, currentUser);
			} else {
				return responseUtils.forbidden(response);
			}
		}
	}

	// Require a correct accept header (require 'application/json' or '*/*')
	if (!acceptsJson(request)) {
		return responseUtils.contentTypeNotAcceptable(response);
	}

	if (filePath === "/api/register") {
		// register new user
		if (method.toUpperCase() === "POST") {
			// Fail if not a JSON request
			if (!isJson(request)) {
				return responseUtils.badRequest(
					response,
					"Invalid Content-Type. Expected application/json"
				);
			}
			// TODO: 8.3 Implement registration
			// You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
			const userData = await parseBodyJson(request);
			return registerUser(response, userData);
		}
	}

	if (filePath === "/api/users") {
		// GET all users
		if (method.toUpperCase() === "GET") {
			// TODO: 8.4 Add authentication (only allowed to users with role "admin")

			// Get current user cred
			const currentUser = await auth.getCurrentUser(request);

			// Verify user cred or responde with 401 error
			if (currentUser === null) {
				return responseUtils.basicAuthChallenge(response);
			}

			// Verify user is admin or resonde with error 403
			if (currentUser.role !== "admin") {
				return responseUtils.forbidden(response);
			}

			// Get users and send it as reponse body
			return getAllUsers(response);
		}
	}

	if (filePath === "/api/products") {
		// User authentication
		const currentUser = await auth.getCurrentUser(request);

		// Verify user cred or responde with 401 error
		if (currentUser === null) {
			return responseUtils.basicAuthChallenge(response);
		}

		// Get all products
		if (method.toUpperCase() === "GET") {
			// Authorised User check
			if (currentUser.role !== "admin" && currentUser.role !== "customer") {
				return responseUtils.forbidden(response);
			}

			return getAllProducts(response);
		}
		// create new product
		if (method.toUpperCase() === "POST") {
			// Fail if not a JSON request
			if (!isJson(request)) {
				return responseUtils.badRequest(
					response,
					"Invalid Content-Type. Expected application/json"
				);
			}
			if (currentUser.role !== "admin") {
				return responseUtils.forbidden(response);
			}
			// You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
			const productData = await parseBodyJson(request);
			return createProduct(response, productData, currentUser);
		}
	}

	if (filePath === "/api/orders") {
		const currentUser = await auth.getCurrentUser(request);

		if (currentUser === null) {
			return responseUtils.basicAuthChallenge(response);
		}

		if (method.toUpperCase() === "GET") {
			if (currentUser.role === "admin") {
				return getAllOrders(response);
			} else if (currentUser.role === "customer") {
				return getAllUserOrders(response, currentUser);
			} else {
				return responseUtils.forbidden(response);
			}
		}

		if (method.toUpperCase() === "POST") {
			if (currentUser.role === "customer") {
				// Fail if not a JSON request
				if (!isJson(request)) {
					return responseUtils.badRequest(
						response,
						"Invalid Content-Type. Expected application/json"
					);
				}
				const orderData = await parseBodyJson(request);
				return createNewOrder(response, orderData, currentUser);
			} else {
				return responseUtils.forbidden(response);
			}
		}
	}
};

module.exports = { handleRequest };
