import { addToCart, updateCartQuantity } from "../data/cart.js";

async function checkAuthentication() {
  try {
    const response = await fetch("/api/users/is-authenticated", {
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
    const response = await fetch("/api/orders", {
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
        <img src="${item.productId.image}" />
      </div>
      <div class="product-details">
        <div class="product-name">${item.productId.name}</div>
        <div class="product-quantity">Quantity: ${item.quantity}</div>
        <div class="product-price">$${(item.priceCents / 100).toFixed(2)}</div>
        <button class="buy-again-button button-primary" data-product-id="${
          item.productId._id
        }">
          Buy it again
        </button>
      </div>
    `
    )
    .join("");

  return `
    <div class="order-container">
      <div class="order-header">
        <div>Order Placed: ${new Date(
          order.datePlaced
        ).toLocaleDateString()}</div>
        <div>Order Total: $${(order.totalCents / 100).toFixed(2)}</div>
        <div>Order ID: ${order._id}</div>
      </div>
      <div class="order-details-grid">${orderItemsHTML}</div>
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
