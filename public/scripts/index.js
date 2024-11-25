import { addToCart, updateCartQuantity } from "../data/cart.js";
import { formatCurrency } from "./utils/money.js";
import { loadProducts } from "../data/products.js";
import "./animations.js";
import "./sidebar.js";
import "./contact.js";
import "./quiz.js";
import "./quizValidation.js";
import "./newsletter.js";
import "./pagination.js";
import "./handleSearch.js";

let currentPage = 1;
let totalPages = 1;

document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayProducts(currentPage);
  observeProductsGrid();
  updateCartQuantity();
});

// Load products and display them, updating pagination
async function fetchAndDisplayProducts(page = 1) {
  try {
    const { products, totalPages: fetchedTotalPages } = await loadProducts(
      page
    );
    totalPages = fetchedTotalPages;
    currentPage = page;

    if (products.length > 0) {
      renderProducts(products);
      renderPagination();
      initAddToCartListeners();
    } else {
      document.querySelector(".js-products-grid").innerHTML =
        "<p>No products found.</p>";
    }
  } catch (error) {
    console.error("Error loading products:", error);
    document.querySelector(".js-products-grid").innerHTML =
      "<p>Error loading products. Please try again later.</p>";
  }
}

// Renders products into the grid
export function renderProducts(productsToRender) {
  const productsGrid = document.querySelector(".js-products-grid");
  if (productsToRender.length === 0) {
    productsGrid.innerHTML = "<p>No results found.</p>";
    return;
  }
  const productsHTML = productsToRender
    .map((product) => generateProductHTML(product))
    .join("");
  productsGrid.innerHTML = productsHTML;
}

// Generates product HTML template
function generateProductHTML(product) {
  return `
    <div class="product-container">
      <div class="product-image-container">
        <img class="product-image" src="${product.image}">
      </div>
      <div class="product-name limit-text-to-2-lines">
        ${product.name}
      </div>
      <div class="product-rating-container">
        <img class="product-rating-stars" src="images/ratings/rating-${
          product.rating.stars * 10
        }.png">
        <div class="product-rating-count link-primary">
          ${product.rating.count}
        </div>
      </div>
      <div class="product-price">
        Ksh ${formatCurrency(product.priceCents)}
      </div>
      <div class="product-quantity-container">
        <select class="js-quantity-selector-${product.id}">
          ${Array.from(
            { length: 10 },
            (_, i) => `<option value="${i + 1}">${i + 1}</option>`
          ).join("")}
        </select>
      </div>
      <div class="product-spacer"></div>
      <div class="added-to-cart" style="opacity:0;">
        <img src="images/icons/checkmark.png"> Added to cart
      </div>
      <button class="add-to-cart-button button-primary js-add-to-cart" data-product-id="${
        product.id
      }">
        Add to Cart
      </button>
    </div>
  `;
}

// Helper function to render Bootstrap pagination buttons
function renderPagination() {
  const paginationContainer = document.querySelector(".js-pagination");
  paginationContainer.innerHTML = "";

  // Previous Button
  paginationContainer.innerHTML += `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
    </li>`;

  // Page Buttons
  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.innerHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
  }

  // Next Button
  paginationContainer.innerHTML += `
    <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
    </li>`;

  // Set up click event listeners for pagination buttons
  paginationContainer.querySelectorAll(".page-link").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const page = parseInt(button.getAttribute("data-page"));
      if (page > 0 && page <= totalPages) {
        fetchAndDisplayProducts(page);
      }
    });
  });
}

// Helper function to check if the user is authenticated
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

// Initializes Add to Cart button listeners
function initAddToCartListeners() {
  const buttons = document.querySelectorAll(".js-add-to-cart");

  buttons.forEach((button) => {
    // Remove any existing click event listener
    button.removeEventListener("click", handleAddToCart);

    // Add a single event listener
    button.addEventListener("click", handleAddToCart);
  });
}

// Separate handler function to avoid re-creating functions in the loop
async function handleAddToCart(event) {
  const button = event.currentTarget; // Use `event.currentTarget` for the specific button
  button.disabled = true; // Disable the button during the request

  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) {
    alert("Please log in to add items to your cart.");
    window.location.href = "/login.html";
    button.disabled = false; // Re-enable if user is redirected
    return;
  }

  const productId = button.dataset.productId;
  const quantitySelector = document.querySelector(
    `.js-quantity-selector-${productId}`
  );
  const quantity = quantitySelector ? parseInt(quantitySelector.value) : 1;

  await addToCart(productId, quantity); // Wait for addToCart to complete
  updateCartQuantity();

  const addedMessage = button.parentElement.querySelector(".added-to-cart");
  if (addedMessage) {
    addedMessage.style.opacity = "1";
    setTimeout(() => (addedMessage.style.opacity = "0"), 2000);
  }

  button.disabled = false; // Re-enable button after request completes
}

// Observes changes to the products grid and re-initializes listeners
function observeProductsGrid() {
  const productsGrid = document.querySelector(".js-products-grid");

  const observer = new MutationObserver(() => {
    initAddToCartListeners();
  });

  observer.observe(productsGrid, { childList: true, subtree: true });
}

// FAQ toggle functionality
document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", !expanded);

    const answer = button.nextElementSibling;
    if (!expanded) {
      answer.style.maxHeight = answer.scrollHeight + "px";
    } else {
      answer.style.maxHeight = 0;
    }
  });
});

// Select elements
const searchBar = document.querySelector(".js-search-bar");
const suggestionsDropdown = document.querySelector(".js-suggestions-dropdown");

// Show suggestions dropdown when user starts typing
searchBar.addEventListener("input", () => {
  if (searchBar.value.trim() !== "") {
    suggestionsDropdown.style.display = "block";
  } else {
    suggestionsDropdown.style.display = "none";
  }
});
