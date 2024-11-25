// productService.js
import { baseURL } from "../constants.js";
import { Product, Clothing } from "../../data/products.js";
import { lazyLoadImages } from "../utils/lazyLoadImages.js";

let currentPage = 1;
let totalPages = 1;
let isLoading = false;

function getProductsPerPage() {
  return window.innerWidth >= 992 ? 15 : 8;
}

function generateSkeletonProductHTML() {
  return `
    <div class="skeleton-product-container">
        <div class="skeleton skeleton-product-image"></div>
        <div class="skeleton skeleton-product-name"></div>
        <div class="skeleton skeleton-product-rating"></div>
        <div class="skeleton skeleton-product-price"></div>
        <div class="skeleton skeleton-product-quantity"></div>
    </div>
  `;
}

function showSkeletons() {
  const productsGrid = document.querySelector(".js-products-grid");
  if (!productsGrid) return;
  productsGrid.innerHTML = "";
  const skeletons = Array.from({ length: getProductsPerPage() })
    .map(generateSkeletonProductHTML)
    .join("");
  productsGrid.insertAdjacentHTML("beforeend", skeletons);
}

export async function fetchProducts(page = 1, categorySlug = null) {
  const limit = getProductsPerPage();
  const loadingElement = document.getElementById("loading");

  if (loadingElement) loadingElement.style.display = "flex";

  try {
    let url = `${baseURL}/api/products?page=${page}&limit=${limit}`;
    if (categorySlug) url += `&category=${encodeURIComponent(categorySlug)}`;

    console.log("Fetching products from URL:", url);

    const response = await fetch(url);
    const data = await response.json();
    if (!data.products || !Array.isArray(data.products)) {
      return { products: [], totalPages: 1 };
    }

    currentPage = data.currentPage;
    totalPages = data.totalPages || 1;

    const processedProducts = data.products.map((productDetails) =>
      productDetails.type === "clothing"
        ? new Clothing(productDetails)
        : new Product(productDetails)
    );

    return { products: processedProducts, totalPages };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], totalPages: 1 };
  } finally {
    if (loadingElement) loadingElement.style.display = "none";
  }
}

export function generateProductHTML(product) {
  return `
    <div class="product-container">
        <div class="product-image-container">
            <img class="product-image lazy" src="" data-src="${
              product.image
            }" alt="${product.name}">
        </div>
        <div class="product-name limit-text-to-2-lines">${product.name}</div>
        <div class="product-rating-container">
            <img class="product-rating-stars" src="${product.getStarUrl()}" alt="Rating: ${
    product.rating.stars
  } stars">
            <div class="product-rating-count link-primary">${
              product.rating.count
            }</div>
        </div>
        <div class="product-price">${product.getPrice()}</div>
        <div class="product-quantity-container">
            <select class="js-quantity-selector-${product.id}">
                ${[...Array(10).keys()]
                  .map((i) => `<option value="${i + 1}">${i + 1}</option>`)
                  .join("")}
            </select>
        </div>
        ${product.extraInfoHtml()}
        <div class="product-spacer"></div>
        <div class="added-to-cart js-added-to-cart-${
          product.id
        } hidden bg-green-100 text-green-800 p-2 rounded">
            <img src="/images/icons/checkmark.png" alt="Added to cart" class="inline-block mr-2"> Added
        </div>
        <button class="add-to-cart-button button-primary js-add-to-cart-button" data-product-id="${
          product.id
        }">
            Add to Cart
        </button>
    </div>
  `;
}

export async function renderProductsGrid(products = []) {
  const productsGrid = document.querySelector(".js-products-grid");
  if (!productsGrid) return;
  productsGrid.innerHTML = "";
  if (!products.length) {
    productsGrid.innerHTML = "<p>No products available at this time.</p>";
    return;
  }
  const productsHTML = products.map(generateProductHTML).join("");
  productsGrid.insertAdjacentHTML("beforeend", productsHTML);
  lazyLoadImages();
}

function observeScroll() {
  const sentinel = document.querySelector(".scroll-sentinel");
  const observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !isLoading) {
        isLoading = true;
        observer.disconnect();
        currentPage++;
        renderProductsGrid(currentPage).then(() => {
          isLoading = false;
        });
      }
    },
    { root: null, rootMargin: "200px", threshold: 0 }
  );
  if (sentinel) observer.observe(sentinel);
}

document.addEventListener("DOMContentLoaded", () => {
  renderProductsGrid();
  //observeScroll();
  window.addEventListener("resize", () => {
    currentPage = 1;
    document.querySelector(".js-products-grid").innerHTML = "";
    renderProductsGrid();
  });
});
