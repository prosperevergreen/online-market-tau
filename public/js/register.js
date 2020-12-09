/**
 * TODO: 8.3 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */
const signinUser = async (email, password) => {
	// create Basic Auth data and hash
	const token = `${email}:${password}`;
	const hashCred = btoa(token);
	// save auth data to local storage
	saveAuthData("Basic", hashCred);
	const jwtToken = await getJSON("/api/login");
	// Report register error or success
	saveAuthData("Bearer", jwtToken);
	await authorize();
	window.location.replace(`${window.location.protocol}//${window.location.hostname}:${ window.location.port}`);
};

// Get for element
const registerForm = document.getElementById("register-form");
// Setup event listener when form is submited
registerForm.addEventListener("submit", async (event) => {
	// Get form data
	const name = document.getElementById("name");
	const email = document.getElementById("email");
	const password = document.getElementById("password");
	const passwordConfirmation = document.getElementById("passwordConfirmation");

	// Prevent default submission
	event.preventDefault();
	// Verify that password match else report error
	if (password.value === passwordConfirmation.value && password.value.length) {
		// Try creating new user or report error on falure
		try {
			const result = await postOrPutJSON("/api/register", "POST", {
				name: name.value,
				email: email.value,
				password: password.value,
			});

			// update browser with user token and role
			await signinUser(email.value, password.value)

		} catch (error) {
			createNotification(`${error}`, "notifications-container", false);
		}
	} else {
		createNotification(
			"Password doesn't match or length less than 10",
			"notifications-container",
			false
		);
	}
});

const loginForm = document.getElementById("login-form");

// Setup event listener when form is submited
loginForm.addEventListener("submit", async (event) => {
	// Get form data
	const email = document.getElementById("login-email").value;
	const password = document.getElementById("login-password").value;

	// Prevent default submission
	event.preventDefault();
	// Verify that password match else report error
	if (password && password.length) {
		// Try creating new user or report error on falure
		try {
			// update browser with user token and role
			await signinUser(email, password);
			loginForm.reset();
		} catch (error) {
			createNotification(`${error}`, "notifications-container", false);
		}
	} else {
		createNotification(
			"Password doesn't match or length less than 10",
			"notifications-container",
			false
		);
	}
});

const showForm = (formId) => {
	loginForm.classList.add("hidden");
	registerForm.classList.add("hidden");
	document.getElementById(formId).classList.remove("hidden");
};
