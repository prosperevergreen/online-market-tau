const responseUtils = require("../utils/responseUtils");
const User = require("../models/user");

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response - server response object to POST /api/register
 * @param {object} userData - JSON data from request body
 *
 * @returns { void }
 */
const registerUser = async (response, userData) => {
	// TODO: 10.1 Implement this

	// Validate user infor and get the missing parts
	const {name, email, password, role } = userData;
	const newUser = new User({name, email, password, role });

	// Some fields are missing respond with error
	const errorMsg = newUser.validateSync();
	if (errorMsg) {
		responseUtils.badRequest(response, errorMsg["_message"]);
		return;
	}

	// If user email already exists, respond with error
	if (await User.findOne({ email: newUser.email }).exec()) {
		responseUtils.badRequest(response, "email already in use");
		return;
	}

	// Set default role to "customer"
	newUser.role = "customer";

	// Save user and respond with copy of the newly created user
	await newUser.save();
	newUser.jwtToken = userData.token;
	responseUtils.createdResource(response, newUser);
};

/**
 * Get user data as JSON
 *
 * @param {http.ServerResponse} response - server response object to GET api/users/userID
 * @param {string} userId - id of the requested user
 * @param {object} currentUser (mongoose document object)
 *
 * @returns { void }
 */
const viewUser = async (response, userId, currentUser) => {
	// TODO: 10.1 Implement this

	// Get user by id
	const user = await User.findById(userId).exec();

	// Check if user exists
	if (user === null) {
		responseUtils.notFound(response);
		return;
	}

	// Send user as JSON
	responseUtils.sendJson(response, user);
};

/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response - server response object to GET api/users
 * @returns { void }
 */
const getAllUsers = async (response) => {
	// TODO: 10.1 Implement this

	// Get all users from database
	const allUsers = await User.find({});
	responseUtils.sendJson(response, allUsers);
};


/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response - server response object to PUT api/users/userID
 * @param {string} userId - id of the requested user
 * @param {object} currentUser (mongoose document object)
 * @param {object} userData JSON data from request body
 * @returns { void }
 */
const updateUser = async (response, userId, currentUser, userData) => {
	// TODO: 10.1 Implement this

	// Respond with 400 if id of admin equals id of user to be deleted
	if (currentUser._id.toString() === userId) {
		responseUtils.badRequest(response, "Updating own data is not allowed");
		return;
	}

	// Validate Role or send error 400
	if (["admin", "customer"].includes(userData.role) === false) {
		responseUtils.badRequest(response, "Role Missing or Not Valid");
		return;
	}

	// Get user to be modified
	const userToModify = await User.findById(userId).exec();

	// Check that user exists
	if (userToModify === null) {
		responseUtils.notFound(response);
		return;
	}

	// update user's role and save changes
	userToModify.role = userData.role;
	await userToModify.save();
	responseUtils.sendJson(response, userToModify);
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response - server response object to DELETE api/users/userID
 * @param {string} userId - id of the requested user
 * @param {object} currentUser (mongoose document object)
 *
 * @returns { void }
 */
const deleteUser = async (response, userId, currentUser) => {
	// TODO: 10.1 Implement this

	// Respond with 400 if id of admin equals id of user to be deleted
	if (currentUser._id.toString() === userId) {
		responseUtils.badRequest(response, "Deleting own data is not allowed");
		return;
	}

	// Get user to be deleted
	const userToDelete = await User.findById(userId).exec();

	// Check if user exists
	if (userToDelete === null) {
		responseUtils.notFound(response);
		return;
	}

	// Delete user by id
	await User.deleteOne({ _id: userId });
	responseUtils.sendJson(response, userToDelete);
};


module.exports = {
	getAllUsers,
	registerUser,
	deleteUser,
	viewUser,
	updateUser,
};
