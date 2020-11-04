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
   productPrice.id = `id-${product._id}`;
   productPrice.innerText = product.price;

   const addButton = clone.querySelector("button");
   addButton.id = `add-to-cart-${product._id}`;

   return clone;
}
//List all products to DOM:
(async () => {

   try{
      //Get products as JSON from server:
      const products = await getJSON("/api/products");
      //Create views with template and append to DOM
      products.forEach((product, i) => {
         const templateClone = setProductView(productTemplate, product);

         productsContainer.appendChild(templateClone);

      });
   }
   catch (err){
      createNotification(`${err}`, "notifications-container",false);
   }
})();
