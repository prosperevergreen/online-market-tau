//Get template from products.html
const productTemplate = document.getElementById("product-template");
//Get container from products.html
const productsContainer = document.getElementById("products-container");

//Buttons only for admins
const addProductButton = document.getElementById("add-new-product");
const newProductForm = document.getElementById("new-product-form");

const formContainer = document.getElementById("modify-form-container");

/**
 *  Creates a HTML-element and populates it with data
 * from product object.
 *
 * @param {HTMLTemplateElement} template - template from products.html
 * @param {object} product - a product object
 * @param {boolean} view - determines if product is in separate view container and
 *                         shouldn't have a clickable card.
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
      productImage.alt = `Image of ${product.name}`;
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
   //Set up clickable card if in products-container
   if(!view){
      card.addEventListener("click", (event) => {
         viewThisProduct(product._id)
         if(!newProductForm.classList.contains("hidden")){
            newProductForm.classList.add("hidden");
            newProductForm.reset();
         }
      });
   }

   //Adding buttons for admins

   if(sessionStorage.getItem("role") === "admin"){
      const adminButtons = document.createElement("div");
      const deleteButton = document.createElement("button");
      const modifyButton = document.createElement("button");

      deleteButton.innerText = "Delete";
      deleteButton.id = `delete-product-${product._id}`;
      deleteButton.classList.add("button");
      deleteButton.addEventListener("click", (event) => {
         deleteProduct(product._id);
         event.stopPropagation();
      }, true);

      adminButtons.appendChild(deleteButton);

      modifyButton.innerText = "Modify";
      modifyButton.id = `modify-product-${product._id}`;
      modifyButton.classList.add("button");
      modifyButton.addEventListener("click", (event) => {
         modifyProduct(product._id);
         event.stopPropagation();
      }, true);

      adminButtons.appendChild(modifyButton);

      card.appendChild(adminButtons);
   }

	return clone;
};


/**
 * Makes create-product-button and -form visible to admins.
 */
const showButtonsAndForm = async () => {
   //Get user role to sessionStorage.
   const auth = await authenticate();

   if(sessionStorage.getItem("role") === "admin"){

      addProductButton.classList.remove("hidden");

      addProductButton.addEventListener("click", () => {
         newProductForm.classList.remove("hidden");
         newProductForm.addEventListener("submit", (event) => {
            createNewOrModifyProduct(event, "POST");
            newProductForm.classList.add("hidden");
         })
      })
   }
}
showButtonsAndForm();


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

/**
 * Requests server in order to create or modify a product.
 *
 * @param {event} event - the event that has all data
 * @param {string} method - determines if we are creating or modifying by defining request method
 * @param {string} id - a product id for constructing a path if modifying a product
 */
const createNewOrModifyProduct = async (event, method, id = null) => {
   event.preventDefault();

   //Values to send to server and database:
   const values = {
      name: event.target.name.value,
      price: parseFloat(event.target.price.value).toFixed(2),
      description: event.target.description.value ?
         event.target.description.value : undefined,
      image: event.target.linkForImage.value ? event.target.linkForImage.value : undefined
   }

   //Endpoint to use
   const path = id ? `/api/products/${id}` : `/api/products`;

   try {
      const result = await postOrPutJSON(path, method, values);

         // Report register error or success
      if (result.error) {
         createNotification(result.error, "notifications-container", false);
      } else {
         const newProduct = setProductView(productTemplate, result, false);
         productsContainer.appendChild(newProduct)
         newProductForm.reset();

         const message = method === "PUT" ? "Updated product" : "Successful product creation"

         createNotification(
            message,
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
 * @returns {Function} - function that creates a cart or add a product to existing cart
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

/**
 * Empties the container that ables one product to be viewed at the top of the page.
 *
 * @param {documentObject} container - a div element on the page.
 */
function emptyContainer(container){
   if(container.childElementCount > 0){
      const arr = Array.from(container.childNodes);
      arr.map(child => container.removeChild(child));
      return;
   }
}

/**
 * Presents a product to the user on the top of the page in a container.
 *
 * @param {string} productId product objects id
 */
async function viewThisProduct(productId){
   try {
      if(viewOneContainer.childElementCount > 0){
         emptyContainer(viewOneContainer);
      }
      if(viewOneContainer.childElementCount == 0){
         const thisProduct = await getJSON(`/api/products/${productId}`);
         viewOneContainer.append(setProductView(productTemplate, thisProduct, true));
         scrollToTop();
         setTimeout( function(){document.addEventListener('scroll', () => {emptyContainer(viewOneContainer)}, {once: true})}, 1000);
      }
	} catch (err) {
		createNotification(`${err}`, "notifications-container", false);
	}
}


/**
 * Deletes a product from database and view.
 *
 * @param {string} productId - id of the product to be deleted
 */
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

const formTemplate = document.getElementById("form-template");

/**
 * Sets up a modification form that is displayed in HTML.
 *
 * @param {HTMLTemplateElement} modifyFormTemplate - a template from products.html
 * @param {HTMLElement} user - a product object
 *
 * @returns {HTMLElement} clone of the template filled with product info
 */
function modifyFormSetup (modifyFormTemplate, product){

	//Populating the modify form with user details.
	const clone = modifyFormTemplate.content.cloneNode(true);
	const titleField = clone.querySelector(".text-align-center");
	titleField.innerText = `Modify product ${product.name}`;

	const productIdField = clone.querySelector("#id-input");
	productIdField.value = product._id;

	const productNameField = clone.querySelector("#name-input");
	productNameField.value = product.name;

	const productPriceField = clone.querySelector("#price-input");
	productPriceField.value = product.price;

   if(product.description){
      const productDescriptionField = clone.querySelector("#description-input");
      productDescriptionField.value = product.description;
   }

   if(product.image){
      const linkForImage = clone.querySelector("#link");
      linkForImage.value = product.image;
   }

	// Get access to modify form field
	const updateForm = clone.querySelector("#edit-product-form");
	//Set event listener to listen for form update submit event
	updateForm.addEventListener("submit", async (e) => {
		// Prevent form from submiting and refreshing page
		e.preventDefault();
      createNewOrModifyProduct(e, "PUT", product._id);
      updateView(clone, product._id);
      e.target.reset();
      emptyContainer(formContainer);


	});

	return clone;
}

/**
 * Allows admin user to modify a specific product. Creates a form for modifying
 * and scrolls to the top of the page to show user the form.
 *
 * @param {string} productId - id of a product to be modified.
 *
 */
const modifyProduct = async (productId) => {
   try {
      // const user
      const product = await getJSON(`/api/products/${productId}`);

      // Populate modify form template with user details
      const clone = modifyFormSetup(formTemplate, product);

      // Append form to form container if empty or replace exiting form
      if (formContainer.children.length > 0) {
           removeElement("modify-product", "edit-product-form");
           formContainer.appendChild(clone);
      } else {
           formContainer.appendChild(clone);
      }
      scrollToTop();
   } catch (error) {
      createNotification(`${error}`, "notifications-container", false);
   }

}

/**
 * Updates view after a product has been modified by replacing the old element with
 * new.
 *
 * @param {Node} product - the new product as a document fragment
 * @param {string} productId - id of the product to be replaced.
 */
const updateView = async (product, productId) => {
   const oldProduct = document.getElementById(`product-${productId}`);
   productsContainer.replaceChild(product, oldProduct);

}
