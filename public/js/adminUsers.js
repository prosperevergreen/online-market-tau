/**
 * TODO: 8.3 List all users (use <template id="user-template"> in users.html)
 *       - Each user should be put inside a clone of the template fragment
 *       - Each individual user HTML should look like this
 *         (notice the id attributes and values, replace "{userId}" with the actual user id)
 *
 *         <div class="item-row" id="user-{userId}">
 *           <h3 class="user-name" id="name-{userId}">Admin</h3>
 *           <p class="user-email" id="email-{userId}">admin@email.com</p>
 *           <p class="user-role" id="role-{userId}">admin</p>
 *           <button class="modify-button" id="modify-{userId}">Modify</button>
 *           <button class="delete-button" id="delete-{userId}">Delete</button>
 *         </div>
 *
 *       - Each cloned template fragment should be appended to <div id="users-container">
 *       - Use getJSON() function from utils.js to fetch user data from server
 *
 **/

//Get template from users.html
const template = document.getElementById("user-template");
//Get container to put the template clones to
const usersContainer = document.getElementById("users-container");
// Get template from users.html
const formTemplate = document.getElementById("form-template");
// Get container to put the template clones to
const formContainer = document.getElementById("modify-user");

/**
 * Creates a HTML-element and populates it with data
 * from user object.
 *
 * @param {HTMLTemplateElement} userTemplate a template from users.html
 * @param {object} user user information as an object
 *
 * @returns {HTMLElement} clone
 */
const setupUserView = (userTemplate, user) => {
	// Clone template
	const clone = userTemplate.content.cloneNode(true);

	//Changing ids and innerTexts of the template clones.
	const itemRow = clone.querySelector(".item-row");
	itemRow.id = `user-${user._id}`;

	const userName = clone.querySelector(".user-name");
	userName.id = `name-${user._id}`;
	userName.innerText = user.name;

	const userEmail = clone.querySelector(".user-email");
	userEmail.id = `email-${user._id}`;
	userEmail.innerText = user.email;

	const userRole = clone.querySelector(".user-role");
	userRole.id = `role-${user._id}`;
	userRole.innerText = user.role;

	const modifyButton = clone.querySelector(".modify-button");
	modifyButton.id = `modify-${user._id}`;
	// Set event listener for modify button
	modifyButton.addEventListener("click", async (event) => {
		// Scroll to modify form field
		scrollToTop();
		// Setup modify form field
		await modifyButtonAction(user._id);
	});


	const deleteButton = clone.querySelector(".delete-button");
	deleteButton.id = `delete-${user._id}`;
	// Set event listener for delete button
	deleteButton.addEventListener("click", async (event) => {
		// Delete user by thier id
		await deleteButtonAction(user._id);
	});

	return clone;
};


/**
 * Displays all users in HTML
 *
 * Function lists all users from database to the HTML.
 * Function calls setupUserView to create clones based on HTML template
 * and appends them to a container.
 * Function is called when user has logged in as an admin.
 */
(async () => {
	// List users to the DOM

	// Try fetching users with getJSON() or report error on failure
	try {
		// Get users as parsed JSON
		const users = await getJSON("/api/users");

		// Loop through the array of users, create clones with template:
		users.forEach((user, i) => {
			// Populate user template with user details
			const clone = setupUserView(template, user);

			//Add clone to container
			usersContainer.appendChild(clone);
		});
	} catch (err) {
		// Present error to the user
		createNotification(`${err}`, "notifications-container", false);
	}

})();

/**
 * TODO: 8.5 Updating/modifying and deleting existing users
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 *       - Use deleteResource() function from utils.js to delete users from server
 *       - Clicking "Delete" button of a user will delete the user and update the listing accordingly
 *       - Clicking "Modify" button of a user will use <template id="form-template"> to
 *         show an editing form populated with the values of the selected user
 *       - The edit form should appear inside <div id="modify-user">
 *       - Afted successful edit of user the form should be removed and the listing updated accordingly
 *       - You can use removeElement() from utils.js to remove the form.
 *       - Remove edit form from the DOM after successful edit or replace it with a new form when another
 *         user's "Modify" button is clicked. There should never be more than one form visible at any time.
 *         (Notice that the edit form has an id "edit-user-form" which should be unique in the DOM at all times.)
 *       - Also remove the edit form when a user is deleted regardless of which user is deleted.
 *       - Modifying a user successfully should show a notification message "Updated user {User Name}"
 *       - Deleting a user successfully should show a notification message "Deleted user {User Name}"
 *       - Use createNotification() function from utils.js to create notifications
 */

/**
 * Moves the view to the top of the page.
 */
function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

/**
 * Removes a user from the database and the view.
 *
 * Function is used as a part of an eventhandler in a user
 * template element delete-button.
 *
 * @param {string} userId - an id of the user
 */
async function deleteButtonAction(userId) {
    // Try deleting user or report error
    try {
        const deletedUser = await deleteResourse(`/api/users/${userId}`);
        // Remove user element from DOM
        removeElement("users-container", `user-${userId}`);

        // Remove modify form if exists
        removeElement("modify-user", "edit-user-form");

        // Send notifictaion for deleted user
        createNotification(
            `Deleted user ${deletedUser.name}`,
            "notifications-container"
        );
    } catch (error) {
        createNotification(`${error}`, "notifications-container", false);
    }
}

/**
 * Gets user data from database and creates a modification
 * form.
 *
 * Function is used as a part of an eventhandler in a user
 * template element modify-button.
 *
 * @param {string} userId - an id of the user
 */
async function modifyButtonAction(userId) {
    // Try fetching full user details or report error
    try {
        // const user
        const user = await getJSON(`/api/users/${userId}`);

        // Populate modify form template with user details
        const clone = modifyFormSetup(formTemplate, user);

        // Append form to form container if empty or replace exiting form
        if (formContainer.children.length > 0) {
            removeElement("modify-user", "edit-user-form");
            formContainer.appendChild(clone);
        } else {
            formContainer.appendChild(clone);
        }
    } catch (error) {
        createNotification(`${error}`, "notifications-container", false);
    }
}

/**
 * Function sets up a modification form that is displayed in HTML.
 *
 * @param {HTMLTemplateElement} modifyFormTemplate - a template from users.html
 * @param {HTMLElement} user - a user object
 *
 * @returns {HTMLElement} clone of the template filled with user info
 */
function modifyFormSetup (modifyFormTemplate, user){

	//Populating the modify form with user details.
	const clone = modifyFormTemplate.content.cloneNode(true);
	const titleField = clone.querySelector(".text-align-center");
	titleField.innerText = `Modify user ${user.name}`;

	const userIdField = clone.querySelector("#id-input");
	userIdField.value = user._id;

	const userNameField = clone.querySelector("#name-input");
	userNameField.value = user.name;

	const userEmailField = clone.querySelector("#email-input");
	userEmailField.value = user.email;

	const userRoleField = clone.querySelector("#role-input");
	userRoleField.value = user.role;

	// Get access to modify form field
	const updateForm = clone.querySelector("#edit-user-form");
	//Set event listener to listen for form update submit event
	updateForm.addEventListener("submit", async (e) => {
		// Prevent form from submiting and refreshing page
		e.preventDefault();

		// Update user role from updated role form field
		user.role = updateForm.querySelector("#role-input").value;

		// Update server with modified user role
		await updateUserAction(user);
	});

	return clone;
}

/**
 * Function sends a modified user information to the server and database.
 *
 * @param {object} user - a user object
 */
async function updateUserAction(user) {
    // Try sending update to server, if error report it as notification
    try {
        const updatedUser = await postOrPutJSON(
            `/api/users/${user._id}`,
            "PUT",
            user
        );
		if(updatedUser.error){
			// Notify the user if successful
			createNotification(
				`Error: ${updatedUser.error}`,
				"notifications-container",
				false
			);
		}else{
			 // Remove the modification form
			 removeElement("modify-user", "edit-user-form");

			 // Update the user role on the page using the user's id
			 (document.getElementById(`role-${user._id}`).innerText =
				 user.role);

			 // Notify the user if successful
			 createNotification(
				 `Updated user ${updatedUser.name}`,
				 "notifications-container"
			 );
		}

    } catch (err) {
        createNotification(`${err}`, "notifications-container", false);
    }
}
