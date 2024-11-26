import { loadCategoryProducts } from "./productApi.js";
import { renderProducts } from "./utils/renderUtils.js";
import { initAddToCartListeners, isAuthenticated } from "./utils/cartUtils.js";
import { updateCartQuantity } from "../data/cart.js";

const productsContainerSelector = ".js-products-grid";
const categoryTitle = document.getElementById("category-title");

const urlParams = new URLSearchParams(window.location.search);
const categorySlug = urlParams.get("category");
categoryTitle.textContent = categorySlug.replace(/-/g, " ").toUpperCase();

let currentPage = 1;
let totalPages = 1;

async function loadAndRenderCategoryProducts(page = 1, limit = 15) {
  const authenticated = await isAuthenticated();
  try {
    const data = await loadCategoryProducts(categorySlug, page, limit);
    totalPages = data.totalPages;

    if (data.products.length > 0) {
      renderProducts(data.products, productsContainerSelector, authenticated);
      if (authenticated) {
        initAddToCartListeners();
      }
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

// Initialize the category page
loadAndRenderCategoryProducts();
initInfiniteScroll();
updateCartQuantity();
