// category.js
import { baseUrl as baseURL } from "./constants.js";
import { Product, Clothing } from "../data/products.js";
import { addToCart, updateCartQuantity } from "../data/cart.js";

const productsContainer = document.querySelector(".js-products-grid");
const categoryTitle = document.getElementById("category-title");

// Retrieve `categorySlug` from the URL
const urlParams = new URLSearchParams(window.location.search);
const categorySlug = urlParams.get("category");
categoryTitle.textContent = categorySlug.replace(/-/g, " ");

let currentPage = 1;
let totalPages = 1;

// Load category products
async function loadCategoryProducts(page = 1, limit = 15) {
  try {
    const response = await fetch(
      `${baseURL}/api/products?category=${categorySlug}&page=${page}&limit=${limit}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to load products: ${response.statusText}`);
    }

    const data = await response.json();
    totalPages = data.totalPages;
    displayProducts(data.products);
  } catch (error) {
    console.error("Error fetching category products:", error);
    productsContainer.innerHTML = "<p>Failed to load products.</p>";
  }
}

// Display products and initialize Add to Cart listeners
function displayProducts(products) {
  products.forEach((productDetails) => {
    const product =
      productDetails.type === "clothing"
        ? new Clothing(productDetails)
        : new Product(productDetails);

    const productHTML = `
      <div class="product-container">
        <div class="product-image-container">
          <img class="product-image" src="${product.image}" alt="${
      product.name
    }" />
        </div>
        <div class="product-name limit-text-to-2-lines">${product.name}</div>
        <div class="product-rating-container">
          <img class="product-rating-stars" src="images/ratings/rating-${
            product.rating.stars * 10
          }.png" alt="${product.rating.stars} stars" />
          <div class="product-rating-count link-primary">${
            product.rating.count
          }</div>
        </div>
        <div class="product-price">$${(product.priceCents / 100).toFixed(
          2
        )}</div>
        <div class="product-quantity-container">
          <select class="js-quantity-selector-${product.id}">
            ${Array.from(
              { length: 10 },
              (_, i) => `<option value="${i + 1}">${i + 1}</option>`
            ).join("")}
          </select>
        </div>
        <div class="added-to-cart" style="opacity:0;">
          <img src="images/icons/checkmark.png"> Added to cart
        </div>
        <button class="button-primary add-to-cart-button js-add-to-cart" data-product-id="${
          product.id
        }">
          Add to Cart
        </button>
      </div>
    `;

    productsContainer.insertAdjacentHTML("beforeend", productHTML);
  });

  initAddToCartListeners(); // Initialize Add to Cart listeners after products are loaded
}

// Initialize Add to Cart listeners
function initAddToCartListeners() {
  const buttons = document.querySelectorAll(".js-add-to-cart");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const isUserAuthenticated = await isAuthenticated();

      if (!isUserAuthenticated) {
        alert("Please log in to add items to your cart.");
        window.location.href = "/login.html";
        return;
      }

      const productId = button.dataset.productId;
      const quantitySelector = document.querySelector(
        `.js-quantity-selector-${productId}`
      );
      const quantity = quantitySelector ? parseInt(quantitySelector.value) : 1;

      addToCart(productId, quantity);
      updateCartQuantity();

      const addedMessage = button.parentElement.querySelector(".added-to-cart");
      if (addedMessage) {
        addedMessage.style.opacity = "1";
        setTimeout(() => (addedMessage.style.opacity = "0"), 2000);
      }
    });
  });
}

// Initialize infinite scroll for loading more products
function initInfiniteScroll() {
  const observer = new IntersectionObserver(
    async (entries) => {
      if (entries[0].isIntersecting && currentPage < totalPages) {
        currentPage++;
        await loadCategoryProducts(currentPage);
      }
    },
    {
      rootMargin: "0px 0px 200px 0px",
    }
  );

  observer.observe(document.querySelector(".js-products-grid"));
}

// Check if the user is authenticated
async function isAuthenticated() {
  try {
    const response = await fetch("/api/users/is-authenticated", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      return data.authenticated;
    }
  } catch (error) {
    console.error("Authentication check failed:", error);
  }
  return false;
}

// Initialize the category page
loadCategoryProducts();
initInfiniteScroll();
updateCartQuantity();
