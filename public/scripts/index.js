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
import { isAuthenticated, initAddToCartListeners } from "./utils/cartUtils.js";
import "./authButton.js";

import "./handleSearch.js";
import "./sidebar.js";
import "./newsletter.js";
import "./contact.js";

let currentPage = 1;
let totalPages = 1;

document.addEventListener("DOMContentLoaded", async () => {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    updateCartQuantity();
  }

  fetchAndDisplayProducts(currentPage, authenticated);
  renderCategories(categories);
  renderFAQs(faqs);
  renderTestimonials(testimonials);
  renderSpecialOffers(specialOffers);
});

// Fetch and display products
async function fetchAndDisplayProducts(page = 1, authenticated = false) {
  try {
    const { products, totalPages: fetchedTotalPages } = await loadProducts(
      page
    );
    totalPages = fetchedTotalPages;
    currentPage = page;

    if (products.length > 0) {
      renderProducts(products, ".js-products-grid", authenticated); // Pass authentication state
      renderPagination(currentPage, totalPages, ".js-pagination", (page) =>
        fetchAndDisplayProducts(page, authenticated)
      );

      // Reinitialize listeners to avoid duplication
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
