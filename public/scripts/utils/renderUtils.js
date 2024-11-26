import { formatCurrency } from "./money.js";
import { initAddToCartListeners } from "./cartUtils.js";
export function renderProducts(products, containerSelector) {
  const productsGrid = document.querySelector(containerSelector);
  if (!productsGrid) return;

  if (products.length === 0) {
    productsGrid.innerHTML = "<p>No results found.</p>";
    return;
  }

  const productsHTML = products
    .map((product) => generateProductHTML(product))
    .join("");
  productsGrid.innerHTML = productsHTML;

  // Initialize Add to Cart listeners after rendering
  initAddToCartListeners();
}

export function generateProductHTML(product) {
  return `
    <div class="product-container">
      <div class="product-image-container">
        <img class="product-image" src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-name limit-text-to-2-lines">
        ${product.name}
      </div>
      <div class="product-rating-container">
        <img class="product-rating-stars" src="images/ratings/rating-${
          product.rating.stars * 10
        }.png" alt="${product.rating.stars} stars">
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
        <img src="images/icons/checkmark.png" alt="Added to cart"> Added to cart
      </div>
      <button class="add-to-cart-button button-primary js-add-to-cart" data-product-id="${
        product.id
      }">
        Add to Cart
      </button>
    </div>
  `;
}

export function renderPagination(
  currentPage,
  totalPages,
  containerSelector,
  onPageClick
) {
  const paginationContainer = document.querySelector(containerSelector);
  if (!paginationContainer) return;

  paginationContainer.innerHTML = `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
    </li>
    ${Array.from({ length: totalPages }, (_, i) => i + 1)
      .map(
        (page) => `
          <li class="page-item ${page === currentPage ? "active" : ""}">
            <a class="page-link" href="#" data-page="${page}">${page}</a>
          </li>
        `
      )
      .join("")}
    <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
    </li>
  `;

  // Attach click event listeners to pagination links
  paginationContainer.querySelectorAll(".page-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const page = parseInt(link.getAttribute("data-page"));
      if (page > 0 && page <= totalPages) {
        onPageClick(page); // Call the provided callback function
      }
    });
  });
}

export function renderCategories(categories) {
  const categoriesSection = document.querySelector(".categories-section");
  if (!categoriesSection) return;

  categoriesSection.innerHTML = `
    <h2>Explore Our Categories</h2>
    <div class="categories-grid">
      ${categories
        .map(
          (category) => `
          <div class="category-item">
            <a href="category.html?category=${category.slug}" class="category-link">
              <div class="category-image">
                <img src="${category.image}" alt="${category.name}" />
              </div>
              <h3>${category.name}</h3>
            </a>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}

export function renderFAQs(faqs) {
  const faqSection = document.querySelector(".faq-section");
  if (!faqSection) return;

  faqSection.innerHTML = `
    <h2>Frequently Asked Questions</h2>
    ${faqs
      .map(
        (faq) => `
        <div class="faq-item">
          <button class="faq-question" aria-expanded="false">
            <i class="fas fa-chevron-right"></i>
            <span class="question-text">${faq.question}</span>
          </button>
          <div class="faq-answer">
            <p>${faq.answer}</p>
          </div>
        </div>
      `
      )
      .join("")}
  `;

  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", !expanded);

      const answer = button.nextElementSibling;
      answer.style.maxHeight = expanded ? 0 : `${answer.scrollHeight}px`;
    });
  });
}

export function renderTestimonials(testimonials) {
  const testimonialsSection = document.querySelector(".testimonials-section");
  if (!testimonialsSection) return;

  testimonialsSection.innerHTML = `
    <h2>What Our Customers Say</h2>
    <div class="testimonials-grid">
      ${testimonials
        .map(
          (testimonial) => `
          <div class="testimonial-item">
            <p>"${testimonial.text}"</p>
            <span>- ${testimonial.name}</span>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}

export function renderSpecialOffers(offers) {
  const offersSection = document.querySelector(".special-offers-section");
  if (!offersSection) return;

  offersSection.innerHTML = `
    <h2>Exclusive Deals</h2>
    <div class="offers-grid">
      ${offers
        .map(
          (offer) => `
          <div class="offer-item">
            <img src="${offer.image}" alt="${offer.text}" />
            <p>${offer.text}</p>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}
