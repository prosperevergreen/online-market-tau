//Get template from products.html
const orderTemplate = document.getElementById("order-template");

const productTemplate = document.getElementById("product-template");

const ordersContainer = document.getElementById("orders-container");

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
const setProductView = (template, product, count) => {
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
	productPrice.innerText = `${product.price} €`;


   const productCount = clone.querySelector(".product-count");
   productCount.id = `count-${product._id}`;

   productCount.innerText = `${count} in this order.`;


	return clone;
};

const setOrderView = (template, order, view) => {
   const clone = template.content.cloneNode(true);

   const itemRow = clone.querySelector(".item-row");
   itemRow.id = `${order._id}`;

   const orderId = clone.querySelector(".order-id");
	orderId.id = `order-${order._id}`;
	orderId.innerText = `Order Id: ${order._id}`;

   const pricesForTotal = [];

   const displayItems = clone.querySelector(".items");
   order.items.forEach((item, i) => {
      const itemsCount = item.quantity;
      const itemsProduct = item.product;
      const price = item.product.price;
      pricesForTotal.push(itemsCount * price);
      const orderedItem = setProductView(productTemplate, itemsProduct, itemsCount);
      displayItems.appendChild(orderedItem);
   })
   const total = clone.querySelector(".order-total");
   total.id = `total-${order._id}`
   total.innerText = `Total: ${pricesForTotal.reduce((a,b) => a + b, 0).toFixed(2)} €`;

   const card = clone.querySelector(".card");
   if(!view){
   card.addEventListener("click", (event) => {viewThisOrder(order._id)});
   }

   return clone;
}

(async () => {
   try {
      //Get orders as JSON from server:
      const orders = await getJSON("/api/orders");
      //Create views with template and append to DOM
		orders.forEach((order, i) => {
			const templateClone = setOrderView(orderTemplate, order, false);
			ordersContainer.appendChild(templateClone);
		});
	} catch (err) {
		createNotification(`${err}`, "notifications-container", false);
	}
   })();


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
    * @param {string} orderId product objects id
    */
   async function viewThisOrder(orderId){
      try {
         if(viewOneContainer.childElementCount > 0){
            emptyViewContainer();
         }
         if(viewOneContainer.childElementCount == 0){
            const thisOrder = await getJSON(`/api/orders/${orderId}`);
            viewOneContainer.append(setOrderView(orderTemplate, thisOrder, true));
            scrollToTop();
            setTimeout( function(){document.addEventListener('scroll', () => {emptyViewContainer()}, {once: true})}, 1000);
         }
   	} catch (err) {
   		createNotification(`${err}`, "notifications-container", false);
   	}
   }

   const findOrder = document.getElementById("search-by-id");

   findOrder.addEventListener("submit", (event) => {
      event.preventDefault();
      const maybeId = event.target.search.value;
      const regex = new RegExp("[0-9a-z]{8,24}");
      if(regex.test(maybeId)){
         const id = maybeId;
         viewThisOrder(id);
         findOrder.reset();
      }
      else{
         createNotification("Please search with valid id", "notifications-container", false);
      }
      })
