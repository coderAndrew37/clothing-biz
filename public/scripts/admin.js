import { baseUrl } from "./constants.js";

async function fetchOrders() {
  try {
    console.log("Fetching admin orders..."); // Debug log
    const response = await fetch(`${baseUrl}/api/orders/admin`, {
      method: "GET",
      credentials: "include", // Ensure cookies are sent
    });

    console.log("Fetch Response Status:", response.status); // Debug log

    if (!response.ok) {
      throw new Error("Failed to fetch orders.");
    }

    const orders = await response.json();
    console.log("Orders fetched:", orders); // Debug log
    renderOrders(orders);
  } catch (error) {
    console.error("Error fetching orders:", error.message); // Debug log
  }
}

function renderOrders(orders) {
  const tableBody = document.getElementById("ordersTable");
  tableBody.innerHTML = orders
    .map(
      (order) => `
    <tr>
      <td class="border border-gray-200 px-4 py-2">${order._id}</td>
      <td class="border border-gray-200 px-4 py-2">${order.name}</td>
      <td class="border border-gray-200 px-4 py-2">
        KSH ${(order.totalCents / 100).toLocaleString("en-KE")}
      </td>
      <td class="border border-gray-200 px-4 py-2">
        <select
          data-order-id="${order._id}"
          class="status-select bg-gray-50 border border-gray-200 rounded px-2 py-1"
        >
          <option value="Preparing" ${
            order.status === "Preparing" ? "selected" : ""
          }>Preparing</option>
          <option value="Shipped" ${
            order.status === "Shipped" ? "selected" : ""
          }>Shipped</option>
          <option value="Delivered" ${
            order.status === "Delivered" ? "selected" : ""
          }>Delivered</option>
        </select>
      </td>
      <td class="border border-gray-200 px-4 py-2">
        <button
          data-order-id="${order._id}"
          class="update-btn text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
        >
          Update
        </button>
      </td>
    </tr>
  `
    )
    .join("");

  attachEventListeners();
}

function attachEventListeners() {
  document.querySelectorAll(".update-btn").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const orderId = event.target.dataset.orderId;
      const statusSelect = document.querySelector(
        `.status-select[data-order-id="${orderId}"]`
      );

      try {
        const response = await fetch(`${baseUrl}/api/orders/admin/${orderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: statusSelect.value }),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to update order.");
        }

        alert("Order updated successfully!");
        fetchOrders(); // Refresh the orders table
      } catch (error) {
        console.error("Error updating order:", error);
        alert("Failed to update order. Please try again.");
      }
    });
  });
}

// Fetch orders on page load
document.addEventListener("DOMContentLoaded", fetchOrders);
