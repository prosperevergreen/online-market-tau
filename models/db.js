const mongoose = require('mongoose');
/**
 * Get database connect URL.
 *
 * Reads URL from DBURL environment variable or
 * returns default URL if variable is not defined
 *
 * @returns {string} connection URL
 */
const getDbUrl = () => {
  const envDBURL = process.env.DBURL;
  const defautDBURL = "mongodb://localhost:27017/WebShopDb";
  return envDBURL === undefined ? defautDBURL : envDBURL;
  // TODO: 9.3 Implement this
  // throw new Error('Implement this');
};

/**
 * Open connection to Mongodb for CRUD operations
 * 
 * @throws { Error } if unsuccessfull
 * @returns { void }
 * 
 */
function connectDB () {
  // Do nothing if already connected
  if (!mongoose.connection || mongoose.connection.readyState === 0) {
    mongoose
      .connect(getDbUrl(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoIndex: true
      })
      .then(() => {
        mongoose.connection.on('error', err => {
          console.error(err);
        });

        mongoose.connection.on('reconnectFailed', handleCriticalError);
      })
      .catch(handleCriticalError);
  }
}

/**
 * Closes connection to Mongodb
 * 
 * @param { Error} err - Mongodn connection error object
 * @throws { Error } 
 * @returns { void }
 * 
 */
function handleCriticalError (err) {
  console.error(err);
  throw err;
}

/**
 * Throws error on catch when connecting to Mongodb
 * 
 * @throws { Error } if unsuccessfull
 * @returns { void }
 * 
 */
function disconnectDB () {
  mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB, getDbUrl };
