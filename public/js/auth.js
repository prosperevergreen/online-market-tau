const saveAuthData = (type, token) => {
	const auth = `${type} ${token}`;
	sessionStorage.setItem("auth-cred", auth);
};

const getAuthData = () => {
	const auth = sessionStorage.getItem("auth-cred");
	return auth;
};

const deleteAuthData = () => {
	sessionStorage.removeItem("auth-cred");
	sessionStorage.removeItem("role");
	window.location.replace(`${window.location.protocol}//${window.location.hostname}:${ window.location.port}`);
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
		sessionStorage.setItem("role", userRole.role);
	} catch (err) {
		createNotification(`${err}`, "notifications-container", false);
	}
};

const getUserRole = () => {
	const currentUserRole = sessionStorage.getItem("role");
	return currentUserRole;
};

const loggedIn = () => {
	const visitorLinkElements = document.querySelectorAll(".visitor-link");
	const userLinkElements = document.querySelectorAll(".user-link");
	const adminLinkElements = document.querySelectorAll(".admin-link");
	visitorLinksArr = Array.from(visitorLinkElements);
	userLinksArr = Array.from(userLinkElements);
	adminLinksArr = Array.from(adminLinkElements);

	visitorLinksArr.map((link) => {
		link.classList.add("hidden");
	});

	userLinksArr.map((link) => {
		link.classList.remove("hidden");
	});

	if (getUserRole() === "admin") {
		adminLinksArr.map((link) => {
			link.classList.remove("hidden");
		});
	}
};

// Check if user is logged in
if (getUserRole()) {
	loggedIn();
}
