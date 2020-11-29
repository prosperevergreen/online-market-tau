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




module.exports = {getAllOrders};
