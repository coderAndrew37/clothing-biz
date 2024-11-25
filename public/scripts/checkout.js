import { renderOrderSummary } from "./renderOrderSummary.js";
import { updateCartQuantity } from "../data/cart.js";

let cartItems = []; // Initialize cartItems as an empty array
let totalCents = 0; // Initialize totalCents

const isValidPhoneNumber = (phone) =>
  /^\+\d{1,3}\s?\d{3}\s?\d{6,}$/.test(phone);

// Fetch and set cart items on page load
// Fetch and set cart items on page load
async function fetchCartItems() {
  try {
    const response = await fetch("/api/cart/get-cart", {
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      cartItems = data.cart || [];

      // Fetch product details for each cart item to include name and priceCents
      const productIds = cartItems.map((item) => item.productId).join(",");
      const productResponse = await fetch(
        `/api/products/by-ids?ids=${productIds}`
      );
      if (productResponse.ok) {
        const products = await productResponse.json();

        // Merge name and priceCents from products into cart items
        cartItems = cartItems.map((item) => {
          const matchingProduct = products.find(
            (product) => product._id === item.productId
          );
          return {
            ...item,
            name: matchingProduct ? matchingProduct.name : "Unknown Item", // Add name if found, or default
            priceCents: matchingProduct ? matchingProduct.priceCents : 0, // Ensure priceCents is present
          };
        });
      } else {
        console.warn("Could not fetch product details.");
      }
    } else {
      console.warn("Could not fetch cart items.");
    }
  } catch (error) {
    console.error("Error fetching cart items:", error);
  }
}

// Attach event listeners for quantity updates and deletions
function attachCartEventListeners() {
  document.querySelectorAll(".js-quantity-select").forEach((select) => {
    select.addEventListener("change", async (event) => {
      const productId = event.target.dataset.productId;
      const newQuantity = parseInt(event.target.value, 10);
      await updateQuantity(productId, newQuantity);
      await renderOrderSummary(); // This will also update payment summary
      updateCartQuantity(); // Update header with cart quantity
    });
  });

  document.querySelectorAll(".js-delete-quantity-link").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const productId = event.target.dataset.productId;
      await updateQuantity(productId, 0); // Setting quantity to 0 for deletion
      await renderOrderSummary(); // This will also update payment summary
      updateCartQuantity(); // Update header with cart quantity
    });
  });
}

// Update quantity or remove item in the cart
async function updateQuantity(productId, newQuantity) {
  try {
    if (newQuantity <= 0) {
      await fetch(`/api/cart/remove-from-cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } else {
      await fetch("/api/cart/update-cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
        credentials: "include",
      });
    }
  } catch (error) {
    console.error("Error updating quantity:", error);
  }
}

// Prefill order form with user data
async function prefillOrderForm() {
  try {
    const response = await fetch("/api/users/profile", {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      const userData = await response.json();
      document.getElementById("name").value = userData?.name || ""; // Use optional chaining and default to empty strings
      document.getElementById("email").value = userData?.email || "";
    } else {
      console.warn("Could not fetch user profile.");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
}

// Show confirmation modal
function showConfirmationModal() {
  const confirmationModal = document.getElementById("confirmationModal");
  confirmationModal.style.display = "block";
}

// Event listeners for opening and closing the modal
function setupModalListeners() {
  const placeOrderButton = document.querySelector(".place-order-button");
  const closeButton = document.querySelector(".close-button");
  const orderDetailsModal = document.getElementById("orderDetailsModal");

  if (!placeOrderButton || !closeButton || !orderDetailsModal) {
    console.warn("Place Order button or modal elements not found.");
    return;
  }

  // Open modal and prefill form
  placeOrderButton.addEventListener("click", async (e) => {
    e.preventDefault();
    await prefillOrderForm(); // Prefill form with user data
    orderDetailsModal.style.display = "flex";
  });

  // Close modal when the 'X' button is clicked
  closeButton.addEventListener("click", () => {
    orderDetailsModal.style.display = "none";
  });

  // Close modal when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === orderDetailsModal) {
      orderDetailsModal.style.display = "none";
    }
  });
}

// Submit order details form
document
  .getElementById("orderDetailsForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const phone = document.getElementById("phone").value;
    if (!isValidPhoneNumber(phone)) {
      alert("Please enter a valid phone number in the format +254 712 345678");
      return;
    }

    // Create a new items array excluding _id from each cart item
    const itemsForSubmission = cartItems.map(
      ({ productId, quantity, priceCents }) => ({
        productId,
        quantity,
        priceCents,
      })
    );

    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone,
      address: document.getElementById("address").value,
      paymentMethod: "Cash on Delivery",
      items: itemsForSubmission, // Use cleaned items array without _id
      totalCents,
    };

    console.log("Form Data:", formData); // Verify the cleaned formData

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Order submission error details:", errorData);
        throw new Error("Failed to place order");
      }

      showConfirmationModal();
      document.getElementById("orderDetailsModal").style.display = "none";
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Could not place order. Please try again.");
    }
  });

// Initial render on page load
document.addEventListener("DOMContentLoaded", async () => {
  await fetchCartItems(); // Load cart items before setting up other components
  await renderOrderSummary(); // This will handle both order and payment summary rendering
  updateCartQuantity(); // Set initial cart quantity in header
  attachCartEventListeners(); // Set up event listeners
  setupModalListeners(); // Set up modal-related event listeners
});
