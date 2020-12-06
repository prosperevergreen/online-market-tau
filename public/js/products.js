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
const setProductView = (template, product, view) => {
	const clone = template.content.cloneNode(true);

   if(product.image){
      const productImage = clone.querySelector(".product-img");
      productImage.id = `${product._id}`;
      productImage.src = product.image;
   }

	const itemRow = clone.querySelector(".item-row");
	itemRow.id = `product-${product._id}`;

	const productName = clone.querySelector(".product-name");
	productName.id = `name-${product._id}`;
	productName.innerText = product.name;

   if(product.description){
      const productDesc = clone.querySelector(".product-description");
      productDesc.id = `description-${product._id}`;
      productDesc.innerText = product.description;
   }

	const productPrice = clone.querySelector(".product-price");
	productPrice.id = `price-${product._id}`;
	productPrice.innerText = `${product.price}`;

	const addButton = clone.querySelector("button");
	addButton.id = `add-to-cart-${product._id}`;
	addButton.addEventListener("click", addToCartButtonPressed(product),true);

   const card = clone.querySelector(".card");
   const productId = product._id;
   if(!view){
      card.addEventListener("click", (event) => {
         viewThisProduct(product._id)
         if(!newProductForm.classList.contains("hidden")){
            newProductForm.classList.add("hidden")
         }
      });
   }

   if(sessionStorage.getItem("role") === "admin"){
      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete";
      deleteButton.id = `delete-product-${product._id}`;
      deleteButton.classList.add("button");
      deleteButton.addEventListener("click", (event) => {
         deleteProduct(product._id);
         event.stopPropagation();
      }, true);
      card.appendChild(deleteButton);
   }

	return clone;
};

const addProductButton = document.getElementById("add-new-product");
const newProductForm = document.getElementById("new-product-form");


const addButtonsAndForm = async () => {
   //Get user role to sessionStorage.
   const auth = await authenticate();

   if(sessionStorage.getItem("role") === "admin"){

      addProductButton.classList.remove("hidden");

      addProductButton.addEventListener("click", () => {
         newProductForm.classList.remove("hidden");
         newProductForm.addEventListener("submit", (event) => {
            createNewProduct(event);
            newProductForm.classList.add("hidden");
         })
      })
   }
}
addButtonsAndForm();


/**
 * Displays all products in HTML
 *
 * Function lists all products from database to the HTML.
 * Function calls setupProductView to create clones based on HTML template
 * and appends them to a container.
 * Function is called when user has logged in and page is viewed.
 */
const fillWithAllProducts = async () => {
	try {
		//Get products as JSON from server:
		const products = await getJSON("/api/products");
		//Create views with template and append to DOM
		products.forEach((product, i) => {
			const templateClone = setProductView(productTemplate, product, false);
			productsContainer.appendChild(templateClone);
		});
	} catch (err) {
		createNotification(`${err}`, "notifications-container", false);
	}
};
fillWithAllProducts();



const createNewProduct = async (event) => {
   event.preventDefault();

   const values = {
      name: event.target.name.value,
      price: parseFloat(event.target.price.value).toFixed(2),
      description: undefined,
      image: undefined
   }
   if(event.target.description.value){
      values.description = event.target.description.value;
   }
   if(event.target.linkForImage.value){
      values.image = event.target.linkForImage.value;
   }

   try {
      const result = await postOrPutJSON("/api/products", "POST", values);
      
         // Report register error or success
      if (result.error) {
         createNotification(result.error, "notifications-container", false);
      } else {
         const newProduct = setProductView(productTemplate, result, false);
         productsContainer.appendChild(newProduct)
         newProductForm.reset();
         createNotification(
            "Successful product creation",
            "notifications-container"
         );
      }
   } catch (error) {
      createNotification(`${error}`, "notifications-container", false);
   }

}


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
      event.stopPropagation();

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

/**
 * Moves the view to the top of the page.
 */
function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

const viewOneContainer = document.querySelector(".view-one-container");

function emptyViewContainer(){
   if(viewOneContainer.childElementCount > 0){
      const arr = Array.from(viewOneContainer.childNodes);
      arr.map(child => viewOneContainer.removeChild(child));
      return;
   }
}

/**
 * This function presents a product to the user on the top of the page.
 *
 * @param {string} productId product objects id
 */
async function viewThisProduct(productId){
   try {
      if(viewOneContainer.childElementCount > 0){
         emptyViewContainer();
      }
      if(viewOneContainer.childElementCount == 0){
         const thisProduct = await getJSON(`/api/products/${productId}`);
         viewOneContainer.append(setProductView(productTemplate, thisProduct, true));
         scrollToTop();
         setTimeout( function(){document.addEventListener('scroll', () => {emptyViewContainer()}, {once: true})}, 1000);
      }
	} catch (err) {
		createNotification(`${err}`, "notifications-container", false);
	}
}



const deleteProduct = async (productId) => {
   try{
      const deletedProduct = await deleteResourse(`/api/products/${productId}`);
        // Remove user element from DOM
        removeElement("products-container", `product-${productId}`);

        // Send notifictaion for deleted user
        createNotification(
            `Deleted product`,
            "notifications-container"
        );
   } catch (error) {
      createNotification(`${error}`, "notifications-container", false);
   }

}
