/* eslint-disable complexity */

const responseUtils = require("./utils/responseUtils");
const { acceptsJson, isJson, parseBodyJson } = require("./utils/requestUtils");
const { renderPublic } = require("./utils/render");
const auth = require("./auth/auth");
const { getAllProducts, createProduct, viewProduct, deleteProduct } = require("./controllers/products");
const {
	getAllUsers,
	registerUser,
	deleteUser,
	viewUser,
	updateUser,
} = require("./controllers/users");
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
	"/api/products": ["GET"],
	"/api/cart": ["GET"],
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
	
	if (matchUserId(filePath)) {
		// TODO: 8.5 Implement view, update and delete a single user by ID (GET, PUT, DELETE)
		// You can use parseBodyJson(request) from utils/requestUtils.js to parse request body

		// Get admin cred or responde with 401 error
		const adminUser = await auth.getCurrentUser(request);
		if (adminUser) {
			// Verify admin or respond with error 403
			if (adminUser.role === "admin") {
				// Get user id from path
				const userId = filePath.split("/")[3];
				// Get user details by id
				const selectedUser = await User.findById(userId).exec();
				// check if user exists else return error 404
				if (selectedUser) {
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
				} else {
					return responseUtils.notFound(response);
				}
			} else {
				return responseUtils.forbidden(response);
			}
		} else {
			return responseUtils.basicAuthChallenge(response);
		}
	}

	// view, update and delete a single product by ID (GET, PUT, DELETE)
	if (matchProductId(filePath)) {
		// TODO: 11.1 Implement 
		// You can use parseBodyJson(request) from utils/requestUtils.js to parse request body

		// Get admin cred or responde with 401 error
		const adminUser = await auth.getCurrentUser(request);
		if (adminUser) {
			// Verify admin or respond with error 403
			if (adminUser.role === "admin") {
				// Get product id from path
				const productId = filePath.split("/")[3];
				
				// GET - send user as response body
				if (method.toUpperCase() === "GET") {
					return viewProduct(response, productId);
				}

				// PUT - Modify user role and send modified user as response body
				if (method.toUpperCase() === "PUT") {
					// Get update info
					const productUpdate = await parseBodyJson(request);
					return updateUser(response, userId, productUpdate);
				}

				// DELETE - Delete user by id and send deleted user as response body
				if (method.toUpperCase() === "DELETE") {
					return deleteProduct(response, productId);
				}
			} else {
				return responseUtils.forbidden(response);
			}
		} else {
			return responseUtils.basicAuthChallenge(response);
		}
	}


	
	// Default to 404 Not Found if unknown url
	if (!(filePath in allowedMethods)) return responseUtils.notFound(response);

	// See: http://restcookbook.com/HTTP%20Methods/options/
	if (method.toUpperCase() === "OPTIONS")
		return sendOptions(filePath, response);

	// Check for allowable methods
	if (!allowedMethods[filePath].includes(method.toUpperCase())) {
		return responseUtils.methodNotAllowed(response);
	}

	// Require a correct accept header (require 'application/json' or '*/*')
	if (!acceptsJson(request)) {
		return responseUtils.contentTypeNotAcceptable(response);
	}

	// GET all users
	if (filePath === "/api/users" && method.toUpperCase() === "GET") {
		// TODO: 8.4 Add authentication (only allowed to users with role "admin")

		// Get admin cred or responde with 401 error
		const adminUser = await auth.getCurrentUser(request);
		if (adminUser) {
			// Verify admin or resonde with error 403
			if (adminUser.role === "admin") {
				// TODO: 8.3 Return all users as JSON
				// Get users and send it as reponse body
				return getAllUsers(response);
			} else {
				return responseUtils.forbidden(response);
			}
		} else {
			return responseUtils.basicAuthChallenge(response);
		}
	}

	// register new user
	if (filePath === "/api/register" && method.toUpperCase() === "POST") {
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

	// Get all products
	if (filePath === "/api/products" && method.toUpperCase() === "GET") {
		// User authentication
		const user = await auth.getCurrentUser(request);

		if (user) {
			// User authorization
			if (user.role === "admin" || user.role === "customer") {
				// Get all products as JSON
				return getAllProducts(response);
			}
		} else {
			return responseUtils.basicAuthChallenge(response);
		}
	}

	

};

module.exports = { handleRequest };
