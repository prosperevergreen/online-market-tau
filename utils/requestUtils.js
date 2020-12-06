const jwt = require("jsonwebtoken");

/**
 * Decode, parse and return user credentials (username and password)
 * from the Authorization header.
 *
 * @param {http.incomingMessage} request - a http request
 * @returns {Array|null} [username, password] or null if header is missing
 */
const getCredentials = (request) => {
	// TODO: 8.4 Parse user credentials from the "Authorization" request header
	// NOTE: The header is base64 encoded as required by the http standard.
	//       You need to first decode the header back to its original form ("email:password").
	//  See: https://attacomsian.com/blog/nodejs-base64-encode-decode
  //       https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/
  
  let creds = null;
	//Get contents of authentication-header format <type> <credentials>
	const authHead = request.headers["authorization"];
	if (authHead) {
		//Divide contents to type and credentials
		const authorization = authHead.split(" ");

		const type = authorization[0];
		//Credentials base64
		const credBase = authorization[1];

		if (type === "Basic") {
			//Decode base64 to utf-8
			const buff = Buffer.from(credBase, "base64");
			const credsStr = buff.toString("utf-8");
      creds = credsStr.split(":");
    }
  }
  return creds;
};

/**
 * Decode, parse and return user credentials (username and password)
 * from the Authorization header.
 *
 * @param {http.incomingMessage} request - a http request
 * @returns {Array|null} [username, password] or null if header is missing
 */
const getCredentialsJWT = (request) => {
	// TODO: 8.4 Parse user credentials from the "Authorization" request header
	// NOTE: The header is base64 encoded as required by the http standard.
	//       You need to first decode the header back to its original form ("email:password").
	//  See: https://attacomsian.com/blog/nodejs-base64-encode-decode
	//       https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/
	//Get contents of authentication-header format <type> <credentials>
	const authHead = request.headers["authorization"];

	if (authHead) {
		//Divide contents to type and credentials
		const authorization = authHead.split(" ");

		const type = authorization[0];
		//Credentials base64
		const credBase = authorization[1];

		if (credBase === null) return;

		if (type === "Bearer") {
			//Decode JWT
			return jwt.verify(
				credBase,
				process.env.ACCESS_TOKEN_SECRET,
				(err, userDetails) => {
          if (err) return;
					return Object.values(userDetails);
				}
			);
		}
	}
};

/**
 * Does the client accept JSON responses?
 *
 * @param {http.incomingMessage} request - a http request
 * @returns {boolean} returns True if client accepts JSON
 */
const acceptsJson = (request) => {
	// TODO: 8.3 Check if the client accepts JSON as a response based on "Accept" request header
	// NOTE: "Accept" header format allows several comma separated values simultaneously
	// as in "text/html,application/xhtml+xml,application/json,application/xml;q=0.9,*/*;q=0.8"
	// Do not rely on the header value containing only single content type!

	const acceptType = request.headers["accept"];
	if (
		acceptType &&
		(acceptType.includes("application/json") || acceptType.includes("*/*"))
	) {
		return true;
	} else {
		return false;
	}
	// throw new Error('Not Implemented');
};

/**
 * Is the client request content type JSON?
 *
 * @param {http.incomingMessage} request - a http request
 * @returns {boolean} - True if contenttype is application/json
 */
const isJson = (request) => {
	// TODO: 8.3 Check whether request "Content-Type" is JSON or not
	const contentType = request.headers["content-type"];
	if (contentType && contentType.includes("application/json")) {
		return true;
	} else {
		return false;
	}

	// throw new Error('Not Implemented');
};

/**
 * Asynchronously parse request body to JSON
 *
 * Remember that an async function always returns a Promise which
 * needs to be awaited or handled with then() as in:
 *
 *   const json = await parseBodyJson(request);
 *
 *   -- OR --
 *
 *   parseBodyJson(request).then(json => {
 *     // Do something with the json
 *   })
 *
 * @param {http.IncomingMessage} request - a http request
 * @returns {Promise<object>} Promise resolves to JSON content of the body
 */
const parseBodyJson = (request) => {
	return new Promise((resolve, reject) => {
		let body = "";

		request.on("error", (err) => reject(err));

		request.on("data", (chunk) => {
			body += chunk.toString();
		});

		request.on("end", () => {
			resolve(JSON.parse(body));
		});
	});
};

module.exports = { acceptsJson, getCredentials, getCredentialsJWT, isJson, parseBodyJson };
