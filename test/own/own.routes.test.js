const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const { handleRequest } = require('../../routes');

chai.use(chaiHttp);

const User = require("../../models/user");

const authorizeUrl = '/api/authorize';
const loginUrl = '/api/login';
const contentType = 'application/json';
chai.use(chaiHttp);

// helper function for authorization headers
const encodeCredentials = (username, password) =>
  Buffer.from(`${username}:${password}`, 'utf-8').toString('base64');

// Get users (create copies for test isolation)
const users = require('../../setup/users.json').map(user => ({ ...user }));

const adminUser = { ...users.find(u => u.role === 'admin') };
const customerUser = { ...users.find(u => u.role === 'customer') };

const adminCredentials = encodeCredentials(adminUser.email, adminUser.password);
const customerCredentials = encodeCredentials(customerUser.email, customerUser.password);
const invalidCredentials = encodeCredentials(adminUser.email, customerUser.password);

//const adminUser = User.findById(adminUserJson._id).exec();
//const customerUser = User.findById(customerUserJson._id).exec();
let allUsers;


describe('Test /api/login path', () => {
   beforeEach(async () => {
      await User.deleteMany({});
      await User.create(users);
      allUsers = await User.find({});
   });
   it('should respond with Basic Auth-challenge if Authorization header is null', async () => {
      const response = await chai
      .request(handleRequest)
      .get(loginUrl)
      .send({});
      expect(response).to.have.status(401);
   });

   it('should respond with Basic Auth-challenge if Authorization header is empty', async () => {
      const response = await chai
      .request(handleRequest)
      .get(loginUrl)
      .set('authorization','')
      .send({});
      expect(response).to.have.status(401);
   });
   it('should respond with "Not acceptable" if Accept header is missing', async () => {
      const response = await chai
      .request(handleRequest)
      .get(loginUrl)
      .set('Authorization', `Basic ${adminCredentials}`)
      .send({});
      expect(response).to.have.status(406);
   });
   it('should respond with "Not acceptable" if JSON is not accepted', async () => {
      const response = await chai
      .request(handleRequest)
      .get(loginUrl)
      .set('Authorization', `Basic ${adminCredentials}`)
      .set('Accept', 'text/html')
      .send({});
      expect(response).to.have.status(406);
   });
   it('should respond with 204 after successful login', async () => {
      const response = await chai
      .request(handleRequest)
      .get(loginUrl)
      .set('Authorization', `Basic ${adminCredentials}`)
      .set('Accept', contentType)
      .send({});
      expect(response).to.have.status(204);
   });
});

describe('Test /api/authorize path', () => {
   it('should respond with Basic Auth-challenge if Authorization header is null', async () => {
      const response = await chai
      .request(handleRequest)
      .get(authorizeUrl)
      .send({});
      expect(response).to.have.status(401);
   });

   it('should respond with Basic Auth-challenge if Authorization header is empty', async () => {
      const response = await chai
      .request(handleRequest)
      .get(authorizeUrl)
      .set('authorization','')
      .send({});
      expect(response).to.have.status(401);
   });
   it('should respond with "Not acceptable" if Accept header is missing', async () => {
      const response = await chai
      .request(handleRequest)
      .get(authorizeUrl)
      .set('Authorization', `Basic ${adminCredentials}`)
      .send({});
      expect(response).to.have.status(406);
   });
   it('should respond with "Not acceptable" if JSON is not accepted', async () => {
      const response = await chai
      .request(handleRequest)
      .get(authorizeUrl)
      .set('Authorization', `Basic ${adminCredentials}`)
      .set('Accept', 'text/html')
      .send({});
      expect(response).to.have.status(406);
   });
   it('should respond with "Not acceptable" if JSON is not accepted', async () => {
      const response = await chai
      .request(handleRequest)
      .get(authorizeUrl)
      .set('Authorization', `Basic ${adminCredentials}`)
      .set('Accept', 'text/html')
      .send({});
      expect(response).to.have.status(406);
   });
   it('should respond with JSON if user is authenticated', async () => {
      const response = await chai
      .request(handleRequest)
      .get(authorizeUrl)
      .set('Authorization', `Basic ${adminCredentials}`)
      .set('Accept', contentType)
      .send({});
      expect(response).to.have.status(200);
      expect(response).to.be.json;
      expect(response.body).to.be.an('object');
   });
   it('should respond with correct user role', async () => {
      const response = await chai
      .request(handleRequest)
      .get(authorizeUrl)
      .set('Authorization', `Basic ${adminCredentials}`)
      .set('Accept', contentType)
      .send({});
      expect(response).to.have.status(200);
      expect(response).to.be.json;
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.key('role');
      expect(response.body.role).to.equal('admin');
   });

});
