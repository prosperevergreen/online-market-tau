const { getAllProductsJson } = require("../utils/products");
const responseUtils = require("../utils/responseUtils");

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response - GET /api/products response object of all the product 
 * @returns { void }
 */
const getAllProducts = async (response) => {
	// TODO: 10.1 Implement this
	// Respond with product JSON
	const allProducts = getAllProductsJson();
	responseUtils.sendJson(response, allProducts);
	//throw new Error('Not Implemented');
};

module.exports = { getAllProducts };
