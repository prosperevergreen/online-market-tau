const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSubSchema = new Schema({
   _id: {
      type: String,
      required: true
   },
   name : {
      type: String,
      required: true
   },
   price : {
      type: Number,
      required: true
   },
   description: { type: String },
});

const ProductSub = new mongoose.model('ProductSub', productSubSchema);

const orderedItemSchema = new Schema({
   product : {
      type: productSubSchema,
      required: true
   },

   quantity : {
      type: Number,
      required: true
   }
});

const orderSchema = new Schema({
  // Mongoose automatically creates _id (ObjectId) to all schemas
  customerId : {
     type: String,
     required: true,
  },
  items : {
     type: [orderedItemSchema],
     required: true,
     validate: arr => arr.length > 0
  }
});

// Omit the version key when serialized to JSON
orderSchema.set('toJSON', { virtuals: false, versionKey: false });



const Order = new mongoose.model('Order', orderSchema);
module.exports = Order;
