/**
 * Week 08 utility file for user related operations
 *
 * NOTE: This file will be abandoned during week 09 when a database will be used
 * to store all data.
 */

const { use } = require("chai");

/**
 * Use this object to store users
 *
 * An object is used so that users can be reset to known values in tests
 * a plain const could not be redefined after initialization but object
 * properties do not have that restriction.
 */
const data = {
	// make copies of users (prevents changing from outside this module/file)
	users: require("../users.json").map((user) => ({ ...user })),
	roles: ["customer", "admin"],
};

/**
 * Reset users back to their initial values (helper function for tests)
 *
 * NOTE: DO NOT EDIT OR USE THIS FUNCTION THIS IS ONLY MEANT TO BE USED BY TESTS
 * Later when database is used this will not be necessary anymore as tests can reset
 * database to a known state directly.
 */
const resetUsers = () => {
	// make copies of users (prevents changing from outside this module/file)
	data.users = require("../users.json").map((user) => ({ ...user }));
};

/**
 * Generate a random string for use as user ID
 * @returns {string}
 */
const generateId = () => {
	let id;

	do {
		// Generate unique random id that is not already in use
		// Shamelessly borrowed from a Gist. See:
		// https://gist.github.com/gordonbrander/2230317

		id = Math.random().toString(36).substr(2, 9);
	} while (data.users.some((u) => u._id === id));

	return id;
};

/**
 * Check if email is already in use by another user
 *
 * @param {string} email
 * @returns {boolean}
 */
const emailInUse = (email) => {
	// TODO: 8.3 Check if there already exists a user with a given email
	const users = data.users;
	return users.some((user) => user.email === email);
	// throw new Error('Not Implemented');
};

/**
 * Return user object with the matching email and password or undefined if not found
 *
 * Returns a copy of the found user and not the original
 * to prevent modifying the user outside of this module.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Object|undefined}
 */
const getUser = (email, password) => {
	// TODO: 8.3 Get user whose email and password match the provided values

	const users = data.users;
	const user = users.find(
		(userX) => userX.email === email && userX.password === password
	);
	if (user) {
		return { ...user };
	}

	// throw new Error('Not Implemented');
};

/**
 * Return user object with the matching ID or undefined if not found.
 *
 * Returns a copy of the user and not the original
 * to prevent modifying the user outside of this module.
 *
 * @param {string} userId
 * @returns {Object|undefined}
 */
const getUserById = (userId) => {
	// TODO: 8.3 Find user by user id
	const users = data.users;
	const user = users.find((userX) => userX._id === userId);
	if (user) {
		return { ...user };
	}

	// throw new Error("Not Implemented");
};

/**
 * Delete user by its ID and return the deleted user
 *
 * @param {string} userId
 * @returns {Object|undefined} deleted user or undefined if user does not exist
 */
const deleteUserById = (userId) => {
	// TODO: 8.3 Delete user with a given id
	const users = data.users;
	const index = users.findIndex((user) => user._id === userId);
	if (index !== -1) {
		const deletedUser = { ...users[index] };
		users.splice(index, 1);
		return deletedUser;
	}

	// throw new Error("Not Implemented");
};

/**
 * Return all users
 *
 * Returns copies of the users and not the originals
 * to prevent modifying them outside of this module.
 *
 * @returns {Array<Object>} all users
 */
const getAllUsers = () => {
	// TODO: 8.3 Retrieve all users
	const newUserArr = [];
	for (const user of data.users) {
		newUserArr.push({ ...user });
	}
	return newUserArr;
	// throw new Error("Not Implemented");
};

/**
 * Save new user
 *
 * Saves user only in memory until node process exits (no data persistence)
 * Save a copy and return a (different) copy of the created user
 * to prevent modifying the user outside this module.
 *
 * DO NOT MODIFY OR OVERWRITE users.json
 *
 * @param {Object} user
 * @returns {Object} copy of the created user
 */
const saveNewUser = (user) => {
	// TODO: 8.3 Save new user
	// Use generateId() to assign a unique id to the newly created user.
	const newUser = { ...user };
	// if (typeof newUser.role === "undefined") {
		newUser.role = data.roles[0];
	// }
	newUser._id = generateId();
	const users = data.users;
	users.push(newUser);
	return { ...newUser };
	// throw new Error("Not Implemented");
};

/**
 * Update user's role
 *
 * Updates user's role or throws an error if role is unknown (not "customer" or "admin")
 *
 * Returns a copy of the user and not the original
 * to prevent modifying the user outside of this module.
 *
 * @param {string} userId
 * @param {string} role "customer" or "admin"
 * @returns {Object|undefined} copy of the updated user or undefined if user does not exist
 * @throws {Error} error object with message "Unknown role"
 */
const updateUserRole = (userId, role) => {
	// TODO: 8.3 Update user's role
	if (data.roles.includes(role)) {
		const users = data.users;
		const user = users.find((userX) => userX._id === userId);
		if (user) {
			user.role = role;
			return { ...user };
		}
	} else {
		throw new Error("Unknown role");
	}
};

/**
 * Validate user object (Very simple and minimal validation)
 *
 * This function can be used to validate that user has all required
 * fields before saving it.
 *
 * @param {Object} user user object to be validated
 * @returns {Array<string>} Array of error messages or empty array if user is valid
 */
const validateUser = (user) => {
	// TODO: 8.3 Validate user before saving
	const errors = [];
	if (typeof user.name === "undefined") {
		errors.push("Missing name");
	}
	if (typeof user.email === "undefined") {
		errors.push("Missing email");
	}
	if (typeof user.password === "undefined") {
		errors.push("Missing password");
	}
	if (typeof user.role !== "undefined" && !data.roles.includes(user.role)) {
		errors.push("Unknown role");
	}
	return errors;
};

module.exports = {
	deleteUserById,
	emailInUse,
	getAllUsers,
	getUser,
	getUserById,
	resetUsers,
	saveNewUser,
	updateUserRole,
	validateUser,
};
