import { addToCart, updateCartQuantity } from "../data/cart.js";
import { loadProducts } from "../data/products.js";
import {
  renderProducts,
  renderPagination,
  renderCategories,
  renderFAQs,
  renderTestimonials,
  renderSpecialOffers,
} from "./utils/renderUtils.js";

import { faqs } from "./data/faqsData.js";
import { categories } from "./data/categoriesData.js";
import { testimonials } from "./data/testimonialsData.js";
import { specialOffers } from "./data/specialOffersData.js";

let currentPage = 1;
let totalPages = 1;

document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayProducts(currentPage);
  updateCartQuantity();
  renderCategories(categories);
  renderFAQs(faqs);
  renderTestimonials(testimonials);
  renderSpecialOffers(specialOffers);
});

// Fetch and display products
async function fetchAndDisplayProducts(page = 1) {
  try {
    const { products, totalPages: fetchedTotalPages } = await loadProducts(
      page
    );
    totalPages = fetchedTotalPages;
    currentPage = page;

    if (products.length > 0) {
      renderProducts(products, ".js-products-grid");
      renderPagination(
        currentPage,
        totalPages,
        ".js-pagination",
        fetchAndDisplayProducts
      );
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
