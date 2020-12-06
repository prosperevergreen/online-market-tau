// load environment vars
require('dotenv').config();

//  Get db
const db = require('./models/db');
// Connect to db
db.connectDB();




const http = require('http');
const { handleRequest } = require('./routes');

const PORT = process.env.PORT || 3000;
const server = http.createServer(handleRequest);

server.on('error', err => {
  console.error(err);
  server.close();
});

server.on('close', () => console.log('Server closed.'));

server.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
