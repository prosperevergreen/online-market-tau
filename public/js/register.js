/**
 * TODO: 8.3 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */

const form = document.getElementById("register-form");

form.addEventListener("submit", async (event) => {
	const password = document.getElementById("password");
	const passwordConfirmation = document.getElementById("passwordConfirmation");
	const name = document.getElementById("name");
	const email = document.getElementById("email");

	if (password.value === passwordConfirmation.value) {
		await postOrPutJSON("/api/register", "POST", {
			name: name.value,
			email: email.value,
			password: password.value,
        });
        form.reset();
        createNotification("Successful registration", "register-form");
	} else {
        createNotification("Password doesn't match", "register-form", false);
		event.preventDefault();
	}
});
