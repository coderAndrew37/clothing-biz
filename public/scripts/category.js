import { baseUrl as baseURL } from "./constants.js";
import { loadCategoryProducts } from "./productApi.js";
import { renderProducts } from "./utils/renderUtils.js";
import { addToCart, updateCartQuantity } from "../data/cart.js";

const productsContainerSelector = ".js-products-grid";
const categoryTitle = document.getElementById("category-title");

// Retrieve `categorySlug` from the URL
const urlParams = new URLSearchParams(window.location.search);
const categorySlug = urlParams.get("category");
categoryTitle.textContent = categorySlug.replace(/-/g, " ").toUpperCase();

let currentPage = 1;
let totalPages = 1;

// Load and display products in the category
async function loadAndRenderCategoryProducts(page = 1, limit = 15) {
  try {
    const data = await loadCategoryProducts(categorySlug, page, limit);
    totalPages = data.totalPages;

    if (data.products.length > 0) {
      renderProducts(data.products, productsContainerSelector);
      initAddToCartListeners(); // Ensure cart listeners are re-initialized
    } else if (page === 1) {
      document.querySelector(productsContainerSelector).innerHTML =
        "<p>No products found in this category.</p>";
    }
  } catch (error) {
    console.error("Error loading category products:", error);
    document.querySelector(productsContainerSelector).innerHTML =
      "<p>Failed to load products.</p>";
  }
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

// Infinite scroll logic
function initInfiniteScroll() {
  const observer = new IntersectionObserver(
    async (entries) => {
      if (entries[0].isIntersecting && currentPage < totalPages) {
        currentPage++;
        await loadAndRenderCategoryProducts(currentPage);
      }
    },
    {
      rootMargin: "0px 0px 200px 0px",
    }
  );

  observer.observe(document.querySelector(productsContainerSelector));
}

// Check if the user is authenticated
async function isAuthenticated() {
  try {
    const response = await fetch(`${baseURL}/api/users/is-authenticated`, {
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
loadAndRenderCategoryProducts();
initInfiniteScroll();
updateCartQuantity();
