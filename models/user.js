const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Cusom validator for user e-mail
const emailValidator = email => {
   return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(email);
};

//Number that defines how well the hash is salted
const saltRounds = 10;

//Set method that hashes the password
const hashPwd = pwd => {
   //Hash only if password is as required
   if(pwd && pwd.length >= 10){
      //Using sync versions of bcrypt to have something to set when returned
      const salt = bcrypt.genSaltSync(saltRounds);
      return bcrypt.hashSync(pwd, salt);
   }
   else{
      return false;
   }
};

const userSchema = new Schema({
  // TODO: 9.4 Implement this
  //Mongoose automatically creates _id (ObjectId) to all schemas
  //Property name
  name : {
     //Validation for name
     type: String,
     required: true,
     //Set function that removes whitespace
     set: val => val.trim(),
     minlength: 1,
     maxlength: 50,
  },
  email : {
     type: String,
     required: true,
     unique: true,
     validate: emailValidator,
  },
  password : {
     type: String,
     required: true,
     minlength: 10,
     //Set function that hashes the password
     set: hashPwd,
     get: hashed => hashed
  },
  role : {
     type: String,
     set: val => val.trim().toLowerCase(),
     enum:['admin','customer'],
     default: 'customer',

 }
});

/**
 * Compare supplied password with user's own (hashed) password
 *
 * @param {string} password
 * @returns {Promise<boolean>} promise that resolves to the comparison result
 */
userSchema.methods.checkPassword = async function (password) {
  // TODO: 9.4 Implement this
  return bcrypt.compare(password, this.password);
};

// Omit the version key when serialized to JSON
userSchema.set('toJSON', { virtuals: false, versionKey: false });

const User = new mongoose.model('User', userSchema);
module.exports = User;
