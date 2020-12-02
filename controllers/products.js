const responseUtils = require("../utils/responseUtils");
const Product = require("../models/product");

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response - GET /api/products response object of all the product
 * @returns { void }
 */
const getAllProducts = async (response) => {
	// TODO: 10.1 Implement this
	// Respond with product JSON
	const allProducts = await Product.find({});
	responseUtils.sendJson(response, allProducts);
};

/**
 * Create new product and send created product back as JSON
 *
 * @param {http.ServerResponse} response - server response object to POST /api/register
 * @param {object} productData - JSON data from request body
 * @param {object} currentUser (mongoose document object)
 *
 * @returns { void }
 */
const createProduct = async (response, productData, currentUser) => {
	// TODO: 10.1 Implement this


	// Authorised User check
	if(currentUser.role !== 'admin'){
		responseUtils.forbidden(response);
		return;
	}

	// Create product mongoose obj
	const newProduct = new Product(productData);

	// Some fields are missing respond with error
	const errorMsg = newProduct.validateSync();
	if (errorMsg) {
		responseUtils.badRequest(response, errorMsg["_message"]);
		return;
	}

	// Save product and respond with copy of the newly created product
	await newProduct.save();
	responseUtils.createdResource(response, newProduct);
};

/**
 * Get product data as JSON
 *
 * @param {http.ServerResponse} response - server response object to GET api/users/userID
 * @param {string} productId - id of the requested product
 *
 * @returns { void }
 */
const viewProduct = async (response, productId) => {
	// TODO: 10.1 Implement this

	// Get product by id
	const product = await Product.findById(productId).exec();

	// Check if product exists
	if (product === null) {
		responseUtils.notFound(response);
		return;
	}

	// Send product as JSON
	responseUtils.sendJson(response, product);
};

/**
 * Modify product and send updated product as JSON
 *
 * @param {http.ServerResponse} response - server response object to PUT api/users/userID
 * @param {string} productId - id of the requested user
 * @param {object} modifyData Product modify data from request body
 * @param {object} currentUser (mongoose document object)
 *
 * @returns { void }
 */
const modifyProduct = async (response, productId, modifyData, currentUser) => {
	// TODO: 10.1 Implement this

	// Authorised User check
	if(currentUser.role !== 'admin'){
		responseUtils.forbidden(response);
		return;
	}

	// Get user to be modified
	const productToModify = await Product.findById(productId).exec();

	// Check that user exists
	if (productToModify === null) {
		responseUtils.notFound(response);
		return;
	}

	if(modifyData.name === undefined || modifyData.name === "" || modifyData.price <= 0){
		responseUtils.badRequest(response, "Product update not Valid");
		return;
	}

	
	// update product and save changes
	Object.entries(modifyData).map(([key, value]) => {
		productToModify[key] = value;
	});

   const errorMsg = productToModify.validateSync();
	if (errorMsg) {
		responseUtils.badRequest(response, errorMsg["_message"]);
		return;
	}
   
	await productToModify.save();
	responseUtils.sendJson(response, productToModify);
};

/**
 * Delete product and send deleted product as JSON
 *
 * @param {http.ServerResponse} response - server response object to DELETE api/users/userID
 * @param {string} productId - id of the requested product to delete
 * @param {object} currentUser (mongoose document object)
 *
 * @returns { void }
 */
const deleteProduct = async (response, productId, currentUser) => {
	// TODO: 10.1 Implement this

	// Authorised User check
	if(currentUser.role !== 'admin'){
		responseUtils.forbidden(response);
		return;
	}

	// Get product to be deleted
	const productToDelete = await Product.findById(productId).exec();

	// Check if product exists
	if (productToDelete === null) {
		responseUtils.notFound(response);
		return;
	}

	// Delete user by id
	await Product.deleteOne({ _id: productId });
	responseUtils.sendJson(response, productToDelete);
};

module.exports = { getAllProducts, createProduct, viewProduct, modifyProduct, deleteProduct };
