const requestUtils = require("../utils/requestUtils");
const users = require("../utils/users");

/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async (request) => {
	// TODO: 8.4 Implement getting current user based on the "Authorization" request header

	// NOTE: You can use getCredentials(request) function from utils/requestUtils.js
	// and getUser(email, password) function from utils/users.js to get the currently
	// logged in user

	const credentials = requestUtils.getCredentials(request);
	if (credentials) {
		return users.getUser(credentials[0], credentials[1]);
	} else {
		return null;
	}
};

module.exports = { getCurrentUser };
