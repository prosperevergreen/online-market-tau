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
	productPrice.innerText = product.price;

   const productCount = clone.querySelector(".product-count");
   productCount.id = `count-${product._id}`;
   productCount.innerText = count;

	return clone;
};

const setOrderView = (template, order) => {
   const clone = template.content.cloneNode(true);

   const itemRow = clone.querySelector(".item-row");
   itemRow.id = `${order._id}`;

   const orderId = clone.querySelector(".order-id");
	orderId.id = `${order._id}`;
	orderId.innerText = order._id;

   const displayItems = clone.querySelector(".items");
   order.items.forEach((item, i) => {
      const itemsCount = item.quantity;
      const itemsProduct = item.product;
      const orderedItem = setProductView(productTemplate, itemsProduct, itemsCount);
      displayItems.appendChild(orderedItem);
   })

   return clone;
}

(async () => {
   try {
      //Get orders as JSON from server:
      const orders = await getJSON("/api/orders");
      //Create views with template and append to DOM
		orders.forEach((order, i) => {
			const templateClone = setOrderView(orderTemplate, order);
			ordersContainer.appendChild(templateClone);
		});
	} catch (err) {
		createNotification(`${err}`, "notifications-container", false);
	}
   })();
