const responseUtils = require("../utils/responseUtils");
const Order = require("../models/order");

/**
 * Gets all orders from database and responds with JSON.
 *
 * @param response - html response
 */
const getAllOrders = async (response) => {
   //Get all orders from database
   const allOrders = await Order.find({}).exec();
	responseUtils.sendJson(response, allOrders);
}

/**
 * Gets all orders of the current user from database and responds with JSON.
 *
 * @param response - html response
 * @param currentUser - mongoose model object
 */
const getAllUserOrders = async (response, currentUser) => {
   //Get all orders from database that belong to current user.
   const userOrders = await Order.find({customerId: currentUser._id}).exec();
   responseUtils.sendJson(response, userOrders);
}

/**
 * Creates a new order and if its valid, saves it to the database.
 *
 * @param response - html response
 * @param orderData - data of the order to be saved
 */
const createNewOrder = async (response, orderData, currentUser) => {
   const id = currentUser._id;
   const newOrder = new Order(orderData);
   newOrder.customerId = id;
   console.log(newOrder);

   const errorMsg = newOrder.validateSync();
   //console.log(errorMsg);
	if (errorMsg) {
		responseUtils.badRequest(response, errorMsg["_message"]);
		return;
	}
   await newOrder.save();
   responseUtils.createdResource(response, newOrder);
}


module.exports = {getAllOrders, getAllUserOrders, createNewOrder};
