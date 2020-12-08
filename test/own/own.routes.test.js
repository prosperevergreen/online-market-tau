const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const { handleRequest } = require('../../routes');

const httpMocks = require('node-mocks-http');

chai.use(chaiHttp);

const User = require("../../models/user");

const authorizeUrl = '/api/authorize';
const loginUrl = '/api/login';
const orderUrl = '/api/orders';
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
describe('Test sendOptions', () => {
   it('should respond 404 not found if requested options with non-allowed path', async () => {
      const response = await chai.request(handleRequest).options('/api/non-existent');
      expect(response).to.have.status(404);
   });
});
describe('Test "not allowed" responses ', () => {
   it('should respond 404 if path is not allowed', async() => {
      const path = "/non/existent"
      const response = await chai.request(handleRequest).post(path).send({});
      expect(response).to.have.status(404);
   });
   it('should respond 405 if method is not allowed for idless path', async() => {
      const path = "/api/cart"
      const response = await chai.request(handleRequest).post(path).send({});
      expect(response).to.have.status(405);
   });
});

describe('Test empty path', () => {
   it('should respond with index.html if path is not given', async () => {
      const response = await chai
      .request(handleRequest)
      .get('')
      .send({});
      expect(response).to.have.status(200);
      expect(response).to.be.html;
   });
   it('should respond with index.html if path is /', async () => {
      const response = await chai
      .request(handleRequest)
      .get('/')
      .send({});
      expect(response).to.have.status(200);
      expect(response).to.be.html;
   });
});

describe('Test /api/login path', () => {
   let allUsers;
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
