const saveAuthData = (type, token) => {
	const auth = `${type} ${token}`;
	localStorage.setItem("auth-cred", auth);
};

const getAuthData = () => {
	const auth = localStorage.getItem("auth-cred");
	return auth;
};

const deleteAuthData = () => {
	localStorage.removeItem("auth-cred");
	window.location.replace("http://localhost:3000");
};

/**
 * Authenticate user by requesting server.
 *
 * Save role to sessionStorage.
 */
const authorize = async () => {
	try {
		//Get products as JSON from server:
		const userRole = await getJSON("/api/authorize");
		if (sessionStorage.getItem("role") === null) {
			sessionStorage.setItem("role", userRole.role);
		} else {
			sessionStorage["role"] = userRole.role;
		}
	} catch (err) {
		createNotification(`${err}`, "notifications-container", false);
	}
};

const loggedIn = () => {
	const visitorLinkElements = document.querySelectorAll(".visitor-link");
    const userLinkElements = document.querySelectorAll(".user-link");
    visitorLinksArr = Array.from(visitorLinkElements);
    userLinksArr = Array.from(userLinkElements);

	visitorLinksArr.map((link) => {
        link.classList.add("hidden")
    });

    userLinksArr.map(link=>{
        link.classList.remove("hidden")
    })
};

// Check if user is logged in
if(getAuthData().includes('Bearer')){
    loggedIn()
}



