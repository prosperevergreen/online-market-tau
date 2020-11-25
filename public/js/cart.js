//Get template from cart.html
const cartTemplate = document.getElementById("cart-item-template");
//Get container from cart.html
const cartsContainer = document.getElementById("cart-container");
// Get place order button
const placeOrderButton = document.getElementById("place-order-button");

/**
 * Creates a HTML element based on template and populates it with 
 * data from product object.
 * 
 * @param {HTMLTemplateElement} template 
 * @param {object} product 
 * 
 * @return {HTMLElement} clone
 */
//Fill a cart item to be displayed:
const setupCartView = (template, product) => {
	const clone = template.content.cloneNode(true);

	const itemRow = clone.querySelector(".item-row");
	itemRow.id = `${product._id}`;

	const productName = clone.querySelector(".product-name");
	productName.id = `name-${product._id}`;
	productName.innerText = product.name;

	const productPrice = clone.querySelector(".product-price");
	productPrice.id = `price-${product._id}`;
	productPrice.innerText = product.price;

	const productAmount = clone.querySelector(".product-amount");
	productAmount.id = `amount-${product._id}`;
	productAmount.innerText = `${product.amount}x`;

	const plusButton = clone.querySelector(".cart-plus-button");
    plusButton.id = `plus-${product._id}`;
    // Setup click listener for plus button
	plusButton.addEventListener(
		"click",
		increaseItemAmount({ productId: product._id, amountDiv: productAmount })
	);

	const minusButton = clone.querySelector(".cart-minus-button");
    minusButton.id = `minus-${product._id}`;
    // Setup click listener for minus button
	minusButton.addEventListener(
		"click",
		decreaseItemAmount({ productId: product._id, amountDiv: productAmount })
	);

	return clone;
};

/**
 * Increases the amount of products in cart and display.
 * 
 * @param {object} param0 
 * @return {function} 
 */
function increaseItemAmount({ productId, amountDiv }) {
	/**
	 * Increases amount of the product in cart with increaseProductCount()
	 * and then updates display.
	 * @param {event} event
	 */
	return function (event) {
		// Increase/save the amount
		increaseProductCount(productId);
		// Update UI
		amountDiv.innerText = `${getProductCountFromCart(productId)}x`;
	};
}

/**
 * Decreases the amount of products in cart and display.
 * 
 * @param {object} param0 
 * @return {function} 
 */
function decreaseItemAmount({ productId, amountDiv }) {
	/**
	 * Decreases amount of the product in cart with decreaseProductCount()
	 * and then updates display. If the product count is lower than one, 
	 * the item is removed from cart.
	 * @param {event} event
	 */
	return function (event) {
		if (getProductCountFromCart(productId) > 1) {
			// Decrease/save the amount of the product in cart
			decreaseProductCount(productId);
			// Update UI
			amountDiv.innerText = `${getProductCountFromCart(productId)}x`;
		} else {
			// Remove product ID from cart
			removeProductFromCart(productId);
		}
	};
}

/**
 * Gets item "cart" from sessionStorage and returns it parsed 
 * into JSON.
 * 
 * @return {string} cart parsed into JSON
 */
function getCart() {
	// Get cart string value
	const cartStrValue = sessionStorage.getItem("cart");
	// Return parsed value
	return JSON.parse(cartStrValue);
}

/**
 * Removes a product from cart sessionStorage item "cart" and 
 * from HTML container.
 * 
 * @param {string} productId 
 */
function removeProductFromCart(productId) {
    // Get previous cart
    const prevCart = getCart();
    // Filter(remove deleted item id from cart)
	const cart = prevCart.filter((id) => id !== productId);
    sessionStorage.removeItem(productId);
    // Update cart
	sessionStorage.setItem("cart", JSON.stringify(cart));
	// Remove the product for UI (DOM)
	removeElement("cart-container", productId);
}

/**
 * Gets a product with the productId from the cart.
 * @param {string} productId 
 * 
 * @return {string} product parsed into JSON
 */
function getProductFromCart(productId) {
	// Get product string value
	const productStrValue = sessionStorage.getItem(productId);
	// Return parsed value
	return JSON.parse(productStrValue);
}

/**
 * Saves changes to a product's count to the cart.
 * 
 * @param {object} product 
 */
function updateProductInCart(product) {
	// Save product to session storage
	sessionStorage.setItem(product._id, JSON.stringify(product));
}

/**
 * Decreases the amount of product in cart and saves the changes 
 * to the sessionStorage with updateProductInCart().
 * @param {string} productId 
 */
function decreaseProductCount(productId) {
	// Get product from cart
	const product = getProductFromCart(productId);
	// Decrease the count
	product.amount--;
	// Update the product
	updateProductInCart(product);
}

/**
 * Increases the amount of product in cart and saves the changes 
 * to the sessionStorage with updateProductInCart().
 * @param {string} productId 
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
 * Gets the product count of a product with the productId from cart.
 * @param {string} productId 
 * @return {}
 */
function getProductCountFromCart(productId) {
    // Get product from cart
    const product = getProductFromCart(productId);
    // Return product amount
	return product.amount;
}

/**
 * Gets all products from the cart and creates an array from them.
 * If there are no products, returns an empty array.
 * @return {Array} productsInCart
 */
function getAllProductsFromCart() {
    // Get cart
    const cart = getCart();
    // Create products array and fill it with products
    if(cart){
      const productsInCart = cart.map(productId => getProductFromCart(productId));
      // return products in cart
      return productsInCart;
   }
   else{
      //If nothing in cart, return empty arr;
      return [];
   }
}

/**
 * Empties the cart and removes it from sessionStorage.
 */
function clearCart() {
    // Get cart
    const cart = getCart();
    //If cart has content, remove all elements in cart
    if(cart){
       const removed =
       cart.map(productId => removeProductFromCart(productId));
    }

    // Delete cart
	sessionStorage.removeItem("cart");
}
/**
 * 
 * Creates a notification when an order is placed by clicking the 
 * "place order"-button. Then clears the cart.
 * @param {event} event 
 */

// Will send data to database to create and save an order.
function placeOrderButtonAction(event) {
	// Notify user of successful order
	createNotification(
		`Successfully created an order!`,
		"notifications-container"
    );
    // Clear cart
	clearCart();
}

placeOrderButton.addEventListener("click", placeOrderButtonAction);
// Get all products in cart
const productsInCart = getAllProductsFromCart();
// load products to UI
const allTemplates =
productsInCart.map(product => cartsContainer.appendChild(setupCartView(cartTemplate,product)));
