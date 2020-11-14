const responseUtils = require("../utils/responseUtils");
const User = require("../models/user");
/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllUsers = async (response) => {
  // TODO: 10.1 Implement this
  
  // Get all users from database
	const allUsers = await User.find({});
	responseUtils.sendJson(response, allUsers);
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
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

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 * @param {Object} userData JSON data from request body
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
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const viewUser = async (response, userId, currentUser) => {
  // TODO: 10.1 Implement this
  
  // Check if userId is same as current user
	if (userId !== currentUser.id) {
    responseUtils.notFound(response);
    return;
  } 

  // Respond with user JSON
  responseUtils.sendJson(response, currentUser);
};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response
 * @param {Object} userData JSON data from request body
 */
const registerUser = async (response, userData) => {
	// TODO: 10.1 Implement this

	// Validate user infor and get the missing parts
	const newUser = new User(userData);

	// Some fields are missing respond with error
	const errorMsg = newUser.validateSync();
	if (errorMsg) {
		responseUtils.badRequest(response, errorMsg["_message"]);
		return;
	}

	// If user email already exists, respond with error
	if (await User.findOne({ email: user.email }).exec()) {
		responseUtils.badRequest(response, "email already in use");
		return;
	}

	// Set default role to "customer"
	newUser.role = "customer";

	// Save user and respond with copy of the newly created user
	await newUser.save();
	responseUtils.createdResource(response, newUser);
};

module.exports = {
	getAllUsers,
	registerUser,
	deleteUser,
	viewUser,
	updateUser,
};
