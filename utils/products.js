
// Reads the product data from product.json and returns.
const productJSON = async () => {return require("../products.json").map((product) => ({...product}))};

module.exports = productJSON;
