/**
 *
 *  <template id="cart-item-template">
 *     <div class="item-row">
 *       <h3 class="product-name">Name</h3>
 *       <p class="product-price">Price</p>
 *       <p class="product-amount">Amount</p>
 *       <button class="cart-minus-plus-button">
 *         +
 *       </button>
 *       <button class="cart-minus-plus-button">
 *         -
 *       </button>
 *     </div>
 *   </template>
 *
 */

//Get template from cart.html
const cartTemplate = document.getElementById("cart-item-template");
//Get container from cart.html
const cartsContainer = document.getElementById("cart-container");
// Get place order button
const placeOrderButton = document.getElementById("place-order-button");

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

function increaseItemAmount({ productId, amountDiv }) {
	return function (event) {
		// Increase/save the amount
		increaseProductCount(productId);
		// Update UI
		amountDiv.innerText = `${getProductCountFromCart(productId)}x`;
	};
}

function decreaseItemAmount({ productId, amountDiv }) {
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

function getCart() {
	// Get cart string value
	const cartStrValue = sessionStorage.getItem("cart");
	// Return parsed value
	return JSON.parse(cartStrValue);
}

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

function getProductFromCart(productId) {
	// Get product string value
	const productStrValue = sessionStorage.getItem(productId);
	// Return parsed value
	return JSON.parse(productStrValue);
}

function updateProductInCart(product) {
	// Save product to session storage
	sessionStorage.setItem(product._id, JSON.stringify(product));
}

function decreaseProductCount(productId) {
	// Get product from cart
	const product = getProductFromCart(productId);
	// Decrease the count
	product.amount--;
	// Update the product
	updateProductInCart(product);
}

function increaseProductCount(productId) {
	// Get product from cart
	const product = getProductFromCart(productId);
	// Increase the count
	product.amount++;
	// Update the product
	updateProductInCart(product);
}

function getProductCountFromCart(productId) {
    // Get product from cart
    const product = getProductFromCart(productId);
    // Return product amount
	return product.amount;
}

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
