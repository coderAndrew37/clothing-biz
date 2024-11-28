import { addToCart, updateCartQuantity } from "../data/cart.js";
import { baseUrl } from "./constants.js";
async function checkAuthentication() {
  try {
    const response = await fetch(`${baseUrl}/api/users/is-authenticated`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Not authenticated");
    const data = await response.json();

    if (!data.authenticated) {
      window.location.href = "/login.html"; // Redirect to login if not authenticated
    }
  } catch (error) {
    console.error("Authentication check failed:", error);
    window.location.href = "/login.html";
  }
}

// Fetch orders data
async function fetchOrders() {
  try {
    const response = await fetch(`${baseUrl}/api/orders`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch orders");

    const data = await response.json();
    renderOrders(data.orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    document.querySelector(".orders-grid").innerHTML =
      "<p>Error loading orders.</p>";
  }
}

// Render fetched orders into the page
function renderOrders(orders) {
  const ordersGrid = document.querySelector(".orders-grid");

  if (orders.length === 0) {
    ordersGrid.innerHTML = "<p>No orders found.</p>";
    return;
  }

  ordersGrid.innerHTML = orders.map((order) => createOrderHTML(order)).join("");
}

// Generate HTML for each order
function createOrderHTML(order) {
  const orderItemsHTML = order.items
    .map(
      (item) => `
        <div class="product-image-container">
          <img src="${item.productId.image}" alt="${item.productId.name}">
        </div>
        <div class="product-details">
          <div class="product-name">${item.productId.name}</div>
          <div class="product-delivery-date">Arriving on: ${new Date(
            item.deliveryDate
          ).toLocaleDateString()}</div>
          <div class="product-quantity">Quantity: ${item.quantity}</div>
          <button class="buy-again-button button-primary">
            <img class="buy-again-icon" src="images/icons/buy-again.png">
            <span class="buy-again-message">Buy it again</span>
          </button>
        </div>
       <div class="product-actions">
  <a href="/tracking.html?orderId=${order._id}&productId=${item.productId._id}">
    <button class="track-package-button button-secondary">
      Track package
    </button>
  </a>
</div>

      `
    )
    .join("");

  return `
    <div class="order-container">
      <div class="order-header">
        <div class="order-header-left-section">
          <div class="order-date">
            <div class="order-header-label">Order Placed:</div>
            <div>${new Date(order.datePlaced).toLocaleDateString()}</div>
          </div>
          <div class="order-total">
            <div class="order-header-label">Total:</div>
            <div>KSH ${(order.totalCents / 100).toLocaleString("en-KE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</div>
          </div>
        </div>
        <div class="order-header-right-section">
          <div class="order-header-label">Order ID:</div>
          <div>${order._id}</div>
        </div>
      </div>
      <div class="order-details-grid">
        ${orderItemsHTML}
      </div>
    </div>
  `;
}

// Attach event listener to "Buy Again" buttons
function attachBuyAgainListeners() {
  const buyAgainButtons = document.querySelectorAll(".buy-again-button");
  console.log(buyAgainButtons.length);

  buyAgainButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const productId = event.currentTarget.dataset.productId;
      await addToCart(productId); // Use the imported addToCart function
      updateCartQuantity(); // Update the cart quantity display
      alert("Product added to cart successfully!");
    });
  });
}

// Run authentication check and fetch orders on page load
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuthentication();
  fetchOrders();
  attachBuyAgainListeners();
});
