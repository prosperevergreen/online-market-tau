const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
// const User = require("../../../models/user");

describe("Refactor Routes", () => {
	it("Refactor handleRequest() in routes.js to implement registerUser() from controllers/users.js", async () => {
        return true;
    });
	it("Refactor handleRequest() in routes.js to implement updateUser() from controllers/users.js", async () => {
        return true;
    });
	it("Refactor handleRequest() in routes.js to implement deleteUser() from controllers/users.js", async () => {
        return true;
    });
	it("Refactor handleRequest() in routes.js to implement getAllUsers() from controllers/users.js", async () => {
        return true;
    });
	it("Refactor handleRequest() in routes.js to implement viewUser() from controllers/users.js", async () => {
        return true;
    });
	it("Refactor handleRequest() in routes.js to implement getAllProducts() from controllers/products.js", async () => {
        return true;
    });
    it("Implement persistant database e.g mongodb", async () => {
      return true;
    });
	it("Implement basic authentication", async () => {
      return true;
    });
	it("Watch video: User stories as GitLab issues", async () => {
      return true;
    });
	it("Refactor code to utilise the MVC model", async () => {
      return true;
    });
});
