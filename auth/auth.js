const requestUtils = require("../utils/requestUtils");
// const users = require("../utils/users");
// require user model
const User = require('../models/user');

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

	// Get request user credentials (Basic Auth)
	const credentials = requestUtils.getCredentials(request);
	// If found exists, return it in parts(type and value) or return null
	if (credentials) {
		const currentUserEmail = credentials[0];
		const currentUserPassword = credentials[1];
		// find one user with an email "email@email.com"
		const emailUser = await User.findOne({ email: currentUserEmail }).exec();
		if (emailUser === null) {
			// User email not found
			return null;
		} else {
			if (emailUser.checkPassword(currentUserPassword)) {
				// password is correct
				return emailUser;
			} else {
				// password is incorrect
				return null;
			}
		}
		// return users.getUser(credentials[0], credentials[1]);
	} else {
		return null;
	}
};

module.exports = { getCurrentUser };
