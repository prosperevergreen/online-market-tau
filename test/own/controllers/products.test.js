const chai = require("chai");
const expect = chai.expect;
const { createResponse } = require("node-mocks-http");
const {
	createProduct,
	viewProduct,
	modifyProduct,
	deleteProduct,
} = require("../../../controllers/products");
const Product = require("../../../models/product");

const User = require("../../../models/user");

// Get users (create copies for test isolation)
const users = require("../../../setup/users.json").map((user) => ({ ...user }));
const admin = { ...users.find((u) => u.role === "admin") };
const customer = { ...users.find((u) => u.role === "customer") };

// Get products (create copies for test isolation)
const products = require("../../../setup/products.json").map((product) => ({
	...product,
}));

// describe('Products Controller', () => {
//   describe('getAllProducts()', () => {
//     it('should respond with JSON', async () => {
//       const response = createResponse();
//       await getAllProducts(response);

//       expect(response.statusCode).to.equal(200);
//       expect(response.getHeader('content-type')).to.equal('application/json');
//       expect(response._isJSON()).to.be.true;
//       expect(response._isEndCalled()).to.be.true;
//       expect(response._getJSONData()).to.be.an('array');
//       expect(response._getJSONData()).to.be.deep.equal(products);
//     });
//   });
// });

describe("Products Controller", () => {
	let adminUser;
	let customerUser;
	let response;
	let productName = "Fantastic Cotton Chair";

	beforeEach(async () => {
		// reset database
		await User.deleteMany({});
		await User.create(users);
		await Product.deleteMany({});
		await Product.create(products);

		// set variables
		adminUser = await User.findOne({ email: admin.email }).exec();
		customerUser = await User.findOne({ email: customer.email }).exec();
		product = await Product.findOne({ name: productName }).exec();
		response = createResponse();
	});

	describe("Admin access", () => {
		describe("viewProduct()", () => {
			it('should respond with "404 Not Found" if product with given productId does not exist', async () => {
				const wrongProductId = product.id.split("").reverse().join("");
				await viewProduct(response, wrongProductId, adminUser);
				expect(response.statusCode).to.equal(404);
				expect(response._isEndCalled()).to.be.true;
			});

			it("should respond with JSON", async () => {
				const productId = product.id;
				const productData = JSON.parse(JSON.stringify(product));
				await viewProduct(response, productId);

				expect(response.statusCode).to.equal(200);
				expect(response.getHeader("content-type")).to.equal("application/json");
				expect(response._isJSON()).to.be.true;
				expect(response._isEndCalled()).to.be.true;
				expect(response._getJSONData()).to.include(productData);
			});
		});
	});

	// describe('updateUser()', () => {
	//   it('should respond with "404 Not Found" if user with given userId does not exist', async () => {
	//     const userId = currentUser.id
	//       .split('')
	//       .reverse()
	//       .join('');
	//     await updateUser(response, userId, currentUser, { role: 'admin' });
	//     expect(response.statusCode).to.equal(404);
	//     expect(response._isEndCalled()).to.be.true;
	//   });

	//   it('should update only the role of the user with userId', async () => {
	//     const userId = customer.id;
	//     const expectedData = {
	//       _id: customer.id,
	//       ...customerUser,
	//       role: 'admin',
	//       password: customer.password
	//     };
	//     await updateUser(response, userId, currentUser, {
	//       name: adminUser.name,
	//       role: 'admin'
	//     });

	//     expect(response.statusCode).to.equal(200);
	//     expect(response.getHeader('content-type')).to.equal('application/json');
	//     expect(response._isJSON()).to.be.true;
	//     expect(response._isEndCalled()).to.be.true;
	//     expect(response._getJSONData()).to.include(expectedData);
	//   });

	//   it('should respond with "400 Bad Request" when userId === currentUser.id', async () => {
	//     const userId = currentUser.id;
	//     const role = currentUser.role;
	//     const expectedData = {
	//       error: 'Updating own data is not allowed'
	//     };
	//     await updateUser(response, userId, currentUser, {
	//       name: adminUser.name,
	//       role: 'customer'
	//     });
	//     const user = await User.findById(currentUser.id);

	//     expect(response.statusCode).to.equal(400);
	//     expect(response.getHeader('content-type')).to.equal('application/json');
	//     expect(response._isJSON()).to.be.true;
	//     expect(response._isEndCalled()).to.be.true;
	//     expect(response._getJSONData()).to.include(expectedData);
	//     expect(user.role).to.equal(role);
	//   });

	//   it('should respond with "400 Bad Request" when role is missing', async () => {
	//     const userId = customer.id;
	//     await updateUser(response, userId, currentUser, { name: adminUser.name });
	//     expect(response.statusCode).to.equal(400);
	//     expect(response._isEndCalled()).to.be.true;
	//   });

	//   it('should respond with "400 Bad Request" when role is not valid', async () => {
	//     const userId = customer.id;
	//     await updateUser(response, userId, currentUser, {
	//       role: adminUser.password
	//     });
	//     expect(response.statusCode).to.equal(400);
	//     expect(response._isEndCalled()).to.be.true;
	//   });
	// });

	// describe('deleteUser()', () => {
	//   it('should respond with "404 Not Found" if user with given userId does not exist', async () => {
	//     const userId = currentUser.id
	//       .split('')
	//       .reverse()
	//       .join('');
	//     await deleteUser(response, userId, currentUser);
	//     expect(response.statusCode).to.equal(404);
	//     expect(response._isEndCalled()).to.be.true;
	//   });

	//   it('should respond with "400 Bad Request" when userId === currentUser.id', async () => {
	//     const userId = currentUser.id;
	//     const expectedData = {
	//       error: 'Deleting own data is not allowed'
	//     };
	//     await deleteUser(response, userId, currentUser);
	//     const user = await User.findById(currentUser.id);

	//     expect(response.statusCode).to.equal(400);
	//     expect(response.getHeader('content-type')).to.equal('application/json');
	//     expect(response._isJSON()).to.be.true;
	//     expect(response._isEndCalled()).to.be.true;
	//     expect(user).to.not.be.null;
	//     expect(user).to.be.an('object');
	//   });

	//   it('should delete existing user with userId', async () => {
	//     const userId = customer.id;
	//     const customerData = JSON.parse(JSON.stringify(customer));
	//     await deleteUser(response, userId, currentUser);

	//     const foundUser = await User.findById(userId).exec();
	//     expect(response.statusCode).to.equal(200);
	//     expect(response.getHeader('content-type')).to.equal('application/json');
	//     expect(response._isJSON()).to.be.true;
	//     expect(response._isEndCalled()).to.be.true;
	//     expect(foundUser).to.be.null;
	//   });

	//   it('should return the deleted user', async () => {
	//     const userId = customer.id;
	//     const customerData = JSON.parse(JSON.stringify(customer));
	//     await deleteUser(response, userId, currentUser);

	//     expect(response.statusCode).to.equal(200);
	//     expect(response.getHeader('content-type')).to.equal('application/json');
	//     expect(response._isJSON()).to.be.true;
	//     expect(response._isEndCalled()).to.be.true;
	//     expect(response._getJSONData()).to.include(customerData);
	//   });
	// });

	// describe('registerUser()', () => {
	//   it('should respond with "400 Bad Request" when email is not valid', async () => {
	//     const testEmail = adminUser.email.replace('@', '');
	//     const userData = { ...adminUser, email: testEmail };
	//     await registerUser(response, userData);
	//     const user = await User.findOne({ email: testEmail }).exec();

	//     expect(response.statusCode).to.equal(400);
	//     expect(response._isEndCalled()).to.be.true;
	//     expect(user).to.be.null;
	//   });

	//   it('should respond with "400 Bad Request" when email is already in use', async () => {
	//     const testEmail = adminUser.email;
	//     const userData = { ...adminUser, email: testEmail };
	//     await registerUser(response, userData);

	//     expect(response.statusCode).to.equal(400);
	//     expect(response._isEndCalled()).to.be.true;
	//   });

	//   it('should respond with "400 Bad Request" when name is missing', async () => {
	//     const testEmail = `test${adminUser.password}@email.com`;
	//     const userData = { ...adminUser, email: testEmail };
	//     delete userData.name;
	//     await registerUser(response, userData);
	//     const user = await User.findOne({ email: testEmail }).exec();

	//     expect(response.statusCode).to.equal(400);
	//     expect(response._isEndCalled()).to.be.true;
	//     expect(user).to.be.null;
	//   });

	//   it('should respond with "400 Bad Request" when password is missing', async () => {
	//     const testEmail = `test${adminUser.password}@email.com`;
	//     const userData = { ...adminUser, email: testEmail };
	//     delete userData.password;
	//     await registerUser(response, userData);
	//     const user = await User.findOne({ email: testEmail }).exec();

	//     expect(response.statusCode).to.equal(400);
	//     expect(response._isEndCalled()).to.be.true;
	//     expect(user).to.be.null;
	//   });

	//   it('should respond with "400 Bad Request" when password is too short', async () => {
	//     const testEmail = `test${adminUser.password}@email.com`;
	//     const testPassword = adminUser.password.substr(0, 9);
	//     const userData = {
	//       ...adminUser,
	//       email: testEmail,
	//       password: testPassword
	//     };
	//     await registerUser(response, userData);
	//     const user = await User.findOne({ email: testEmail }).exec();

	//     expect(response.statusCode).to.equal(400);
	//     expect(response._isEndCalled()).to.be.true;
	//     expect(user).to.be.null;
	//   });

	//   it('should respond with "201 Created" when registration is successful', async () => {
	//     const testEmail = `test${adminUser.password}@email.com`;
	//     const userData = { ...adminUser, email: testEmail };
	//     await registerUser(response, userData);
	//     const createdUser = await User.findOne({ email: testEmail });

	//     expect(response.statusCode).to.equal(201);
	//     expect(response.getHeader('content-type')).to.equal('application/json');
	//     expect(response._isJSON()).to.be.true;
	//     expect(response._isEndCalled()).to.be.true;
	//     expect(createdUser).to.not.be.null;
	//     expect(createdUser).to.not.be.undefined;
	//     expect(createdUser).to.be.an('object');
	//   });

	//   it('should set user role to "customer" when registration is successful', async () => {
	//     const testEmail = `test${adminUser.password}@email.com`;
	//     const userData = { ...adminUser, email: testEmail };
	//     await registerUser(response, userData);
	//     const createdUser = await User.findOne({ email: testEmail });

	//     expect(response.statusCode).to.equal(201);
	//     expect(response.getHeader('content-type')).to.equal('application/json');
	//     expect(response._isJSON()).to.be.true;
	//     expect(response._isEndCalled()).to.be.true;
	//     expect(createdUser).to.not.be.null;
	//     expect(createdUser).to.not.be.undefined;
	//     expect(createdUser).to.be.an('object');
	//     expect(createdUser.role).to.equal('customer');
	//   });

	//   it('should return the created user as JSON', async () => {
	//     const testEmail = `test${adminUser.password}@email.com`;
	//     const userData = { ...adminUser, email: testEmail };
	//     await registerUser(response, userData);
	//     const createdUser = await User.findOne({ email: testEmail });
	//     const expectedData = JSON.parse(JSON.stringify(createdUser));

	//     expect(response.statusCode).to.equal(201);
	//     expect(response.getHeader('content-type')).to.equal('application/json');
	//     expect(response._isJSON()).to.be.true;
	//     expect(response._isEndCalled()).to.be.true;
	//     expect(createdUser).to.not.be.null;
	//     expect(createdUser).to.not.be.undefined;
	//     expect(createdUser).to.be.an('object');
	//     expect(response._getJSONData()).to.include(expectedData);
	//   });
	// });
});
