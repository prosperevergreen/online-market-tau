/**
 * Use this object to store products
 *
 * An object is used so that products can be reset to known values in tests
 * a plain const could not be redefined after initialization but object
 * properties do not have that restriction.
 */
const data = {
    // make copies of products (prevents changing from outside this module/
    // Reads the product data from product.json and returns.file)
	products: require("../products.json").map((product) => ({ ...product }))
};

/**
 * Return all products
 *
 * Returns copies of the products and not the originals
 * to prevent modifying them outside of this module.
 *
 * @returns {Array<Object>} all products
 */
const getAllProductsJson = () => {
   const productsInMem = data.products;
	const newProductArr = productsInMem.map((product) => ({ ...product }));

	return newProductArr;
};

module.exports = { getAllProductsJson };
