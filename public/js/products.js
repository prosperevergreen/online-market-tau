//Get template from products.html
const productTemplate = document.getElementById("product-template");
//Get container from products.html
const productsContainer = document.getElementById("products-container");

/**
 *  Creates a HTML-element and populates it with data
 * from product object.
 *
 * @param {HTMLTemplateElement} template - template from products.html
 * @param {object} product - a product object
 *
 * @returns {HTMLElement} clone of the template filled with product info
 */
//Fill a product template to be displayed:
const setProductView = (template, product) => {
	const clone = template.content.cloneNode(true);

   const productImage = clone.querySelector(".product-img");
   productImage.id = `${product._id}`;
   productImage.src = product.image;

	const itemRow = clone.querySelector(".item-row");
	itemRow.id = `${product._id}`;

	const productName = clone.querySelector(".product-name");
	productName.id = `name-${product._id}`;
	productName.innerText = product.name;

	const productDesc = clone.querySelector(".product-description");
	productDesc.id = `description-${product._id}`;
	productDesc.innerText = product.description;

	const productPrice = clone.querySelector(".product-price");
	productPrice.id = `price-${product._id}`;
	productPrice.innerText = `${product.price} €`;

	const addButton = clone.querySelector("button");
	addButton.id = `add-to-cart-${product._id}`;
	addButton.addEventListener("click", addToCartButtonPressed(product));

	return clone;
};

/**
 * Displays all products in HTML
 *
 * Function lists all products from database to the HTML.
 * Function calls setupProductView to create clones based on HTML template
 * and appends them to a container.
 * Function is called when user has logged in and page is viewed.
 */
(async () => {
	try {
		//Get products as JSON from server:
		const products = await getJSON("/api/products");
		//Create views with template and append to DOM
		products.forEach((product, i) => {
			const templateClone = setProductView(productTemplate, product);
			productsContainer.appendChild(templateClone);
		});
	} catch (err) {
		createNotification(`${err}`, "notifications-container", false);
	}
})();

/**
 * Adds an item to the cart in sessionStorage.
 *
 * @param {object} product - a product object
 * @returns {Function} function that creates a cart or add a product to existing cart
 */
function addToCartButtonPressed(product) {
/**
 * Creates a cart or adds a product to existing cart in session storage.
 *
 * @param {object} event - the click of the "add to cart"-button.
 */
	return function (event) {
		// event and product will be available here

		// Get cart from session storage
		const cartValue = getCart();
		// Check if cart exist parse it to array else create new cart
		const cart = cartValue === null ? [] : cartValue;

		/**
		 * If product is already in cart increase its amount else add it to cart
		 * set and the amount to 1
		 */
		if (cart.includes(product._id)) {
			// Increase product count in cart
			increaseProductCount(product._id);
		} else {
			// Add new item to cart
			addProductToCart(cart, product);
		}

		// Notify user of success
		createNotification(
			`Added ${product.name} to cart!`,
			"notifications-container"
		);
	};
}

/**
 * Adds a product to sessionStorage item named "cart".
 *
 * @param {object} cart - cart as JSON object
 * @param {object} product - a product object
 */
function addProductToCart(cart, product) {
	// Add new item to cart list by id
	cart.push(product._id);
	// Save cart to session Storage
	sessionStorage.setItem("cart", JSON.stringify(cart));
	// Set product amount to 1
	product.amount = 1;
	// Save product to session storage
	sessionStorage.setItem(product._id, JSON.stringify(product));
}

/**
 * Increases the amount of product in cart and saves the changes
 * to the sessionStorage with updateProductInCart().
 *
 * @param {string} productId - an id of a product object
 */
function increaseProductCount(productId) {
	// Get product from cart
	const product = getProductFromCart(productId);
	// Increase the count
	product.amount++;
	// Update the product
	updateProductInCart(product);
}

/**
 * Saves changes to a product's count to the cart.
 *
 * @param {object} product - a product object
 */
function updateProductInCart(product) {
	// Save product to session storage
	sessionStorage.setItem(product._id, JSON.stringify(product));
}

/**
 * Gets item "cart" from sessionStorage and returns it parsed
 * into JSON.
 *
 * @returns {string} cart parsed into JSON
 */
function getCart() {
	// Get cart string value
	const cartStrValue = sessionStorage.getItem("cart");
	// Return parsed value
	return JSON.parse(cartStrValue);
}

/**
 * Gets a product with the productId from the cart.
 *
 * @param {string} productId - an id of a product object
 *
 * @returns {string} product parsed into JSON
 */
function getProductFromCart(productId) {
	// Get product string value
	const productStrValue = sessionStorage.getItem(productId);
	// Return parsed value
	return JSON.parse(productStrValue);
}
