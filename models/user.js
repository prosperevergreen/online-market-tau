const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Custom validator for user e-mail format
 * 
 * @param { string } email - user email to be verified 
 * @returns { boolean } - return the validity of the email
 */
const emailValidator = email => {
   return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(email);
};

// Number that defines how well the hash is salted
const saltRounds = 10;

/**
 * Set method that hashes the password
 * 
 * @param { string } pwd - user password to be hashed
 * @returns { string | boolean } - returns password hashed string or false if password length < 10
 */
const hashPwd = pwd => {
   // Hash only if password is as long as required
   if(pwd && pwd.length >= 10){
      // Using sync versions of bcrypt to have something to set when returned
      const salt = bcrypt.genSaltSync(saltRounds);
      return bcrypt.hashSync(pwd, salt);
   }
   else{
      return false;
   }
};

const userSchema = new Schema({
  // TODO: 9.4 Implement this
  // Mongoose automatically creates _id (ObjectId) to all schemas
  name : {
     // Validation for name
     type: String,
     required: true,
     // Set function that removes whitespace
     set: val => val.trim(),
     minlength: 1,
     maxlength: 50,
  },
  email : {
     type: String,
     required: true,
     unique: true,
     // Using custom validator
     validate: emailValidator,
  },
  password : {
     type: String,
     required: true,
     minlength: 10,
     // Set function that hashes the password
     set: hashPwd,
     get: hashed => hashed
  },
  role : {
     type: String,
     set: val => val.trim().toLowerCase(),
     // Checks if value is in the arr
     enum:['admin', 'customer'],
     // Sets default value for role
     default: 'customer',
 }
});

/**
 * Compare supplied password with user's own (hashed) password
 *
 * @param {string} password - hashed password to be validated
 * @returns {Promise<boolean>} - promise that resolves to the comparison result
 */
userSchema.methods.checkPassword = function (password) {
  // TODO: 9.4 Implement this
  return bcrypt.compareSync(password, this.password);
};

// Omit the version key when serialized to JSON
userSchema.set('toJSON', { virtuals: false, versionKey: false });

const User = new mongoose.model('User', userSchema);
module.exports = User;
