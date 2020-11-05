//Get template from products.html
const productTemplate = document.getElementById("product-template");
//Get container from products.html
const productsContainer = document.getElementById("products-container");

//Fill a product template to be displayed:
const setProductView = (template, product) => {
	const clone = template.content.cloneNode(true);

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
	productPrice.innerText = product.price;

	const addButton = clone.querySelector("button");
	addButton.id = `add-to-cart-${product._id}`;
	addButton.addEventListener("click", addToCartButtonPressed(product));

	return clone;
};
//List all products to DOM:
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

function addToCartButtonPressed(product) {
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

function increaseProductCount(productId) {
	// Get product from cart
	const product = getProductFromCart(productId);
	// Increase the count
	product.amount++;
	// Update the product
	updateProductInCart(product);
}

function updateProductInCart(product) {
	// Save product to session storage
	sessionStorage.setItem(product._id, JSON.stringify(product));
}

function getCart() {
	// Get cart string value
	const cartStrValue = sessionStorage.getItem("cart");
	// Return parsed value
	return JSON.parse(cartStrValue);
}

function getProductFromCart(productId) {
	// Get product string value
	const productStrValue = sessionStorage.getItem(productId);
	// Return parsed value
	return JSON.parse(productStrValue);
}
