/**
 * TODO: 8.3 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */

// Get for element
const form = document.getElementById("register-form");

// Setup event listener when form is submited
form.addEventListener("submit", async (event) => {

    // Get form data
	const password = document.getElementById("password");
	const passwordConfirmation = document.getElementById("passwordConfirmation");
	const name = document.getElementById("name");
    const email = document.getElementById("email");

    // Prevent default submission
    event.preventDefault();

    // Verify that password match else report error
	if (password.value === passwordConfirmation.value) {
        // Try creating new user or report error on falure
        try {
            await postOrPutJSON("/api/register", "POST", {
                name: name.value,
                email: email.value,
                password: password.value,
            });
            form.reset();
            createNotification("Successful registration", "notifications-container");
        } catch (error) {
            createNotification(
                `${error}`,
                "notifications-container",
                false);
        }
		
	} else {
        createNotification("Password doesn't match", "notifications-container", false);
	}
});
