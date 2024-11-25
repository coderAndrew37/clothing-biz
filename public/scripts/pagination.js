export let currentPage = 1;
let productsPerPage = calculateProductsPerPage();

// Calculate products per page based on grid layout
export function calculateProductsPerPage() {
  const productsGrid = document.querySelector(".products-grid");
  if (!productsGrid) return 8;

  const gridColumnCount = window
    .getComputedStyle(productsGrid)
    .gridTemplateColumns.split(" ").length;
  const screenWidth = window.innerWidth;
  return screenWidth <= 768 ? 8 : gridColumnCount * 3;
}

// Initialize pagination and render the first page
export function initPagination(
  totalPages,
  renderProductsCallback,
  fetchProducts
) {
  currentPage = 1;
  setupPaginationEventListeners(
    renderProductsCallback,
    totalPages,
    fetchProducts
  );
}

// Render products for a specific page
export function renderProductsPage(products, page, renderProductsCallback) {
  productsPerPage = calculateProductsPerPage();
  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginatedProducts = products.slice(start, end);

  renderProductsCallback(paginatedProducts);
  updatePaginationButtons(products.length, page);
}

// Update pagination buttons for Bootstrap structure
function updatePaginationButtons(totalProducts, page) {
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = "";

  paginationContainer.innerHTML += `
    <li class="page-item ${page === 1 ? "disabled" : ""}" id="previous-page">
      <a class="page-link" href="#" aria-label="Previous">Previous</a>
    </li>`;

  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.innerHTML += `
      <li class="page-item ${i === page ? "active" : ""}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
  }

  paginationContainer.innerHTML += `
    <li class="page-item ${
      page === totalPages ? "disabled" : ""
    }" id="next-page">
      <a class="page-link" href="#" aria-label="Next">Next</a>
    </li>`;
}

// Set up event listeners for pagination buttons
function setupPaginationEventListeners(
  renderProductsCallback,
  totalPages,
  fetchProducts
) {
  document.querySelector(".pagination").addEventListener("click", (event) => {
    event.preventDefault();
    const target = event.target;

    if (target.classList.contains("page-link")) {
      const newPage = target.dataset.page
        ? parseInt(target.dataset.page)
        : target.parentElement.id === "next-page"
        ? currentPage + 1
        : currentPage - 1;

      if (newPage > 0 && newPage <= totalPages) {
        currentPage = newPage;
        fetchProducts(currentPage); // Fetch the correct page from server
      }
    }
  });
}
