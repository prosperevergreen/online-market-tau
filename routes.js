/* eslint-disable complexity */
const responseUtils = require("./utils/responseUtils");
const { acceptsJson, isJson, parseBodyJson } = require("./utils/requestUtils");
const { renderPublic } = require("./utils/render");
const {
	emailInUse,
	getAllUsers,
	saveNewUser,
	validateUser,
	getUserById,
	deleteUserById,
} = require("./utils/users");
const auth = require("./auth/auth");

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
	"/api/register": ["POST"],
	"/api/users": ["GET"],
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

// eslint-disable-next-line complexity
// eslint-disable-next-line max-lines-per-function
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
		const adminUser = await auth.getCurrentUser(request);
		if (adminUser) {
			if (adminUser.role === "admin") {
				const userId = filePath.split("/")[3];
				const user = getUserById(userId);
				if (user) {
					if (method.toUpperCase() === "GET") {
						responseUtils.sendJson(response, user);
					}

					if (method.toUpperCase() === "PUT") {
						const updateUser = await parseBodyJson(request);

            // loop through the modification data to update user
            for (const [key, value] of Object.entries(updateUser)) {
              // console.log(`${key}: ${value}`);
              user[key] = value;
            }

            console.log("Old data");
            console.log(user);
            console.log("\n\n\nData recieved");
            console.log(updateUser);
            console.log("\n\n\nUpdated data");
            console.log(user);
            
						deleteUserById(userId);
						saveNewUser(user);
						responseUtils.noContent(response);
					}

					if (method.toUpperCase() === "DELETE") {
            const deletedUser = deleteUserById(userId);
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
		const adminUser = await auth.getCurrentUser(request);

		if (adminUser) {
			if (adminUser.role === "admin") {
        // TODO: 8.3 Return all users as JSON
        const allUsers = getAllUsers();
				return responseUtils.sendJson(response, allUsers);
			} else {
				return responseUtils.forbidden(response);
			}
		} else {
			return responseUtils.basicAuthChallenge(response);
		}

		// throw new Error('Not Implemented');
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
		const errorMsg = validateUser(user);
		// Some fields are missing respond with error
		if (errorMsg.length > 0) {
			return responseUtils.badRequest(response, errorMsg);
		}
		// If user email already exists, respond with error
		if (emailInUse(user.email)) {
			return responseUtils.badRequest(response, "email already in use");
		}
		// Save user and respond with copy of the newly created user
		return responseUtils.createdResource(response, saveNewUser(user));
	}
};

module.exports = { handleRequest };
