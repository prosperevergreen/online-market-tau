/* eslint-disable complexity */

const responseUtils = require("./utils/responseUtils");
const { acceptsJson, isJson, parseBodyJson } = require("./utils/requestUtils");
const { renderPublic } = require("./utils/render");
const auth = require("./auth/auth");
const { getAllProducts } = require("./controllers/products");
const { getAllUsers,
        registerUser,
        deleteUser,
        viewUser,
        updateUser } = require("./controllers/users")
// Require user model
const User = require("./models/user");

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
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response
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
 * @param {string} url filePath
 * @param {string} prefix
 * @returns {boolean}
 */
const matchIdRoute = (url, prefix) => {
	const idPattern = "[0-9a-z]{8,24}";
	const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
	return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean}
 */
const matchUserId = (url) => {
	return matchIdRoute(url, "users");
};

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
			// Verify admin or resonde with error 403
			if (adminUser.role === "admin") {
				// Get user id
				const userId = filePath.split("/")[3];
				// Get user details by id
				const user = await User.findById(userId).exec();
				// check if user exists else return error 404
				if (user) {
					// GET - send user as response body
					if (method.toUpperCase() === "GET") {
						viewUser(response, userId, user);
					}
					// PUT - Modify user role and send modified user as response body
					if (method.toUpperCase() === "PUT") {
						// Get update info
						const update = await parseBodyJson(request);

						// Validate Role or send error 400
						if (["admin", "customer"].includes(update.role)) {
							// updating an existing user
							const existingUser = await User.findById(userId).exec();
							// change user's name and save changes
							existingUser.role = update.role;
							await existingUser.save();
							// const updatedUser = updateUserRole(userId, update.role);
							responseUtils.sendJson(response, existingUser);
						} else {
							responseUtils.badRequest(response, "Role Missing or Not Valid");
						}
					}

					// DELETE - Delete user by id and send deleted user as response body
					if (method.toUpperCase() === "DELETE") {
						const deletedUser = await User.findById(userId).exec();
						await User.deleteOne({ _id: userId });
						// const deletedUser = deleteUserById(userId);
						responseUtils.sendJson(response, deletedUser);
					}
				} else {
					responseUtils.notFound(response);
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
            getAllUsers(response);
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
		const user = await parseBodyJson(request);
		// Validate user infor and get the missing parts
		const newUser = new User(user);

		// Some fields are missing respond with error
		const errorMsg = newUser.validateSync();
		if (errorMsg) {
			return responseUtils.badRequest(response, errorMsg["_message"]);
		}

		// If user email already exists, respond with error
		if (await User.findOne({ email: user.email }).exec()) {
			return responseUtils.badRequest(response, "email already in use");
		}
		// Set role to "customer"
		newUser.role = "customer";
		// Save user and respond with copy of the newly created user
		await newUser.save();
		return responseUtils.createdResource(response, newUser);
	}

	// Get all products
	if (filePath === "/api/products" && method.toUpperCase() === "GET") {
		// User authentication
		const user = await auth.getCurrentUser(request);

		if (user) {
			// User authorization
			if (user.role === "admin" || user.role === "customer") {
				// Get all products as JSON
				const allProducts = getAllProducts(response);
			}
		} else {
			return responseUtils.basicAuthChallenge(response);
		}
	}
};

module.exports = { handleRequest };
