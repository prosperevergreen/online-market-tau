const requestUtils = require("../utils/requestUtils");
// require user model
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const verifyUser = async (email, password) => {
	// Find one user with an email "email@email.com"
	const emailUser = await User.findOne({ email: email }).exec();

	// User email not found
	if (emailUser === null) return null;

	// password is correct
	if (emailUser.checkPassword(password)) return emailUser;

	// password is incorrect
	return null;
};

/**
 * Get current user based on the request headers
 *
 * @param { http.IncomingMessage } request - HTTP request for getting current user based on the "Authorization" request header
 * @returns { object | null } - current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async (request) => {
	// TODO: 8.4 Implement getting current user based on the "Authorization" request header

	// NOTE: You can use getCredentials(request) function from utils/requestUtils.js
	// and getUser(email, password) function from utils/users.js to get the currently

	// Get request user credentials (Basic Auth)
	const credentials = requestUtils.getCredentials(request);

	// If found exists, return it in parts(type and value) or return null
	if (!credentials) return null;

	const currentUserEmail = credentials[0];
	const currentUserPassword = credentials[1];

	return verifyUser(currentUserEmail, currentUserPassword);
};

/**
 * Get current user based on the request headers
 *
 * @param { http.IncomingMessage } request - HTTP request for getting current user based on the "Authorization" request header
 * @returns { object | null } - current authenticated user or null if not yet authenticated
 */
const getCurrentUserJWT = async (request) => {
	// TODO: 8.4 Implement getting current user based on the "Authorization" request header

	// NOTE: You can use getCredentials(request) function from utils/requestUtils.js
	// and getUser(email, password) function from utils/users.js to get the currently

	// Get request user credentials (Basic Auth)
	const credentials = requestUtils.getCredentialsJWT(request);
	// If found exists, return it in parts(type and value) or return null
	if (!credentials) return null;

	const currentUserEmail = credentials[0];
	const currentUserPassword = credentials[1];

	return verifyUser(currentUserEmail, currentUserPassword);
};

const createJWTWebToken = (request) => {
	// Get request user credentials (Basic Auth)
	const credentials = requestUtils.getCredentials(request);

	// If found exists, return it in parts(type and value) or return null
	if (!credentials) return null;

	const currentUserEmail = credentials[0];
	const currentUserPassword = credentials[1];

	const token = jwt.sign(
		{ currentUserEmail, currentUserPassword },
		process.env.ACCESS_TOKEN_SECRET
	);
	return token;
};

module.exports = { getCurrentUser, getCurrentUserJWT, createJWTWebToken };
