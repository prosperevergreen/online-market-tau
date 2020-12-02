const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Custom validator for user product format
 *
 * @param { string } url - product image url
 * @returns { boolean } - return the validity of the url
 */
const urlValidator = (url) => {
	return /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g.test(url);
};

const productSchema = new Schema({
	// Mongoose automatically creates _id (ObjectId) to all schemas
	// Product name
	name: {
		type: String,
		required: true,
	},
	// Price of one product in Euros, without the Euro sign (€). Euros and cents are in the same float, with cents coming after the decimal point
	price: {
		type: Number,
		required: true,
		min: 0.01,
		get: (val) => parseFloat(val.toFixed(2)),
	},
	// Adding product images to the Web store API and pages is a Level 2 development grader substitute
	image: {
		type: String,
		validate: urlValidator,
	},
	description: {
		type: String,
	},
});


// Omit the version key when serialized to JSON
productSchema.set("toJSON", { virtuals: false, versionKey: false });

const Product = new mongoose.model("Product", productSchema);
module.exports = Product;
