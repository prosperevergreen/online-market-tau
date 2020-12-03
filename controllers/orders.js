const responseUtils = require("../utils/responseUtils");
const Order = require("../models/order");

/**
 * Gets all orders from database and responds with JSON.
 *
 * @param {object} response - html response
 */
const getAllOrders = async (response) => {
   //Get all orders from database
   const allOrders = await Order.find({}).exec();
	responseUtils.sendJson(response, allOrders);
};

/**
 * Gets all orders of the current user from database and responds with JSON.
 *
 * @param {object} response - html response
 * @param {object} currentUser - mongoose model object
 */
const getAllUserOrders = async (response, currentUser) => {
   //Get all orders from database that belong to current user.
   const userOrders = await Order.find({customerId: currentUser._id}).exec();
   responseUtils.sendJson(response, userOrders);
};

/**
 * Gets any one order from database. Allowed to admins. Responds order as JSON.
 * If order is not found, responds with 404 not found.
 *
 * @param {object} response - html response
 * @param {string} orderId - id of the order given in path by user
 */
const getAnyOrder = async (response, orderId) => {
   const theOrder = await Order.findById(orderId).exec();
   if(theOrder){
      responseUtils.sendJson(response, theOrder);
   }
   else{
      responseUtils.notFound(response);
   }
};

/**
 * Gets one order from database. Responds it as JSON if it is the customers own order.
 * If order is not found, responds with 404 not found.
 *
 * @param {object} response - html response
 * @param {string} orderId - id of the order given in path by user
 * @param {object} currentUser - mongoose model object
 */
const getOneOrder = async (response, orderId, currentUser) => {
   const theOrder = await Order.findById(orderId).exec();

   if(theOrder && theOrder.customerId === currentUser._id.toString()){
      responseUtils.sendJson(response, theOrder);
   }
   else{
      responseUtils.notFound(response);
   }
};

/**
 * Creates a new order and if its valid, saves it to the database.
 *
 * @param {object} response - html response
 * @param {object} orderData - data of the order to be saved in JSON
 * @param {object} currentUser (mongoose document object)
 */
const createNewOrder = async (response, orderData, currentUser) => {
   const id = currentUser._id;
   const newOrder = new Order(orderData);
   newOrder.customerId = id;

   const errorMsg = newOrder.validateSync();
   //console.log(errorMsg);
	if (errorMsg) {
		responseUtils.badRequest(response, errorMsg["_message"]);
		return;
	}
   await newOrder.save();
   responseUtils.createdResource(response, newOrder);
};


module.exports = {getAllOrders, getAllUserOrders, getAnyOrder, getOneOrder, createNewOrder};
