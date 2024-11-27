import { addToCart, updateCartQuantity } from "../data/cart.js";
import { loadProductDetails } from "../data/products.js";

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("productId");

// Redirect if no product ID
if (!productId) {
  alert("Invalid product. Redirecting to homepage.");
  window.location.href = "/";
}

// DOM Elements
const productImage = document.querySelector(".js-product-image");
const productName = document.querySelector(".js-product-name");
const productPrice = document.querySelector(".js-product-price");
const productDescription = document.querySelector(".js-product-description");
const sizeSelector = document.querySelector(".js-size-selector");
const quantitySelector = document.querySelector(".js-quantity-selector");
const addToCartButton = document.querySelector(".js-add-to-cart");
const addedToCartNotification = document.querySelector(
  ".added-to-cart-notification"
);

// Load product details
async function displayProductDetails() {
  try {
    const product = await loadProductDetails(productId);

    // Populate product details
    productImage.src = product.image;
    productName.textContent = product.name;
    productPrice.textContent = `Ksh ${product.price}`;
    productDescription.textContent = product.description;

    // Populate sizes
    sizeSelector.innerHTML = product.sizes
      .map((size) => `<option value="${size}">${size}</option>`)
      .join("");
  } catch (error) {
    console.error("Failed to load product details:", error);
    alert("Failed to load product details. Redirecting to homepage.");
    window.location.href = "/";
  }
}

// Add to cart
addToCartButton.addEventListener("click", async () => {
  const selectedSize = sizeSelector.value;
  const quantity = parseInt(quantitySelector.value);

  if (!selectedSize) {
    alert("Please select a size.");
    return;
  }

  try {
    await addToCart(productId, quantity, selectedSize);
    updateCartQuantity();

    // Show success notification
    addedToCartNotification.classList.add("active");
    setTimeout(() => {
      addedToCartNotification.classList.remove("active");
      window.location.href = "/checkout.html";
    }, 1500);
  } catch (error) {
    console.error("Failed to add product to cart:", error);
    alert("Failed to add product to cart. Please try again.");
  }
});

// Initialize product details
displayProductDetails();
