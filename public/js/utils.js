/**
 * Asynchronously fetch JSON from the given url. (GET)
 *
 * Uses fetch to get JSON from the backend and returns the parsed
 * JSON back.
 *
 * Remember that an async function always returns a Promise which
 * needs to be awaited or handled with then() as in:
 *
 *   const json = await getJSON("/api/users");
 *
 *   -- OR --
 *
 *   getJSON("/api/users").then(json => {
 *     // Do something with the json
 *   })
 *
 * @param {string} url resource url on the server
 * @returns {Promise<*>} promise that resolves to the parsed JSON
 */
const getJSON = async (url) => {
	// TODO: 8.3 Implement this
	// Create and setup header to accept json
	const header = new Headers();
	header.append("Accept", "application/json, */*");
	// header.set("Authorization", localStorage.getItem("auth-cred"));
	// Setup fetch metadata
	const fetchDataSetup = {
		method: "GET",
		headers: header,
	};

	// Do fetch and return body of response as js object
	return fetch(url, fetchDataSetup).then((res) => res.json());
	// throw new Error('Not Implemented');
};

/**
 * Asynchronously update existing content or create new content on the server (PUT or POST)
 *
 * Uses fetch to send data as JSON to the server and returns the response as JSON.
 * Again remember that async function always returns a Promise.
 *
 * @param {string} url resource url on the server
 * @param {string} method "PUT" or "POST"
 * @param {object|Array} data payload data be sent to the server as JSON
 * @returns {Promise<*>} promise that resolves to the parsed JSON
 */
const postOrPutJSON = async (url, method, data = {}) => {
	method = method.toUpperCase();
	if (method !== "POST" && method !== "PUT") {
		throw "Invalid method! Valid methods are POST and PUT!";
	}

	// TODO: 8.3 Implement this
	// Create and setup header to specify its content type as json
	const header = new Headers();
	header.append("Content-Type", "application/json");
	// header.set("Authorization", localStorage.getItem("auth-cred"));

	// Setup fetch metadata
	const fetchDataSetup = {
		method: method,
		body: JSON.stringify(data),
		headers: header,
	};

	// Do fetch and return response as JSON
	return fetch(url, fetchDataSetup).then((res) => res.json());
	// throw new Error("Not Implemented");
};

/**
 * Asynchronously remove a resource from the server (DELETE)
 *
 * Uses fetch to send the request to the server and returns the response as JSON.
 * Again remember that async function always returns a Promise.
 *
 * @param {string} url resource url on the server
 * @returns {Promise<*>} promise that resolves to the parsed JSON
 */
const deleteResourse = async (url) => {
	// TODO: 8.5 Implement this
	// throw new Error("Not Implemented");
	const header = new Headers();
	header.append("Accept", "application/json, */*");
	// header.set("Authorization",localStorage.getItem("auth-cred"))

	// Setup fetch metadata
	const fetchDataSetup = {
		method: "DELETE",
		headers: header,
	};

	// Do fetch and return body of response as js object
	return fetch(url, fetchDataSetup).then((res) => res.json());
};

/**
 * Generate random unique id to use as id value on notifications
 * or other HTML elements (remember that IDs must be unique within
 * a document).
 *
 * @returns {string} a generated id
 */
const generateId = () => {
	// Shamelessly borrowed from a Gist. See:
	// https://gist.github.com/gordonbrander/2230317
	return "_" + Math.random().toString(36).substr(2, 9);
};

/**
 * Create a notification message that disappears after five seconds.
 *
 * Appends a new paragraph inside the container element and gives it
 * class based on the status of the message (success or failure).
 *
 * @param {string} message a message to be displayed to user
 * @param {string} containerId id attribute of the container element
 * @param {boolean} isSuccess whether the message describes a success or a failure
 */
const createNotification = (message, containerId, isSuccess = true) => {
	const container = document.getElementById(containerId);

	// Create new p element to hold text
	const newParagraph = document.createElement("p");

	// Create unique id for the notification so that it can easily be removed after timeout
	const notificationId = generateId();
	newParagraph.id = notificationId;

	// Set CSS class for the paragraph based on the isSuccess variable
	newParagraph.classList.add(
		isSuccess ? "background-lightgreen" : "background-red"
	);

	// Add message test inside the paragraph and append the paragraph to the container
	newParagraph.append(document.createTextNode(message));
	container.append(newParagraph);

	// After five seconds remove the notification
	setTimeout(() => {
		removeElement(containerId, notificationId);
	}, 5000);
};

/**
 * Remove an element (and its descendants) from the DOM.
 *
 * @param {string} containerId containing element's id
 * @param {string} elementId id of the element to be removed
 */
const removeElement = (containerId, elementId) => {
	const container = document.getElementById(containerId);
	container
		.querySelectorAll(`[id="${elementId}"]`)
		.forEach((element) => element.remove());
};

/**
 * Authenticate user by requesting server.
 *
 * Save role to sessionStorage.
 */
const authenticate = async () => {
   try {
		//Get products as JSON from server:
		const userRole = await getJSON("/api/authenticate");
      if(sessionStorage.getItem("role") === null){
         sessionStorage.setItem("role", userRole.role);

      }
      else{
         sessionStorage["role"] = userRole.role;
      }

	} catch (err) {
		createNotification(`${err}`, "notifications-container", false);
	}

}
