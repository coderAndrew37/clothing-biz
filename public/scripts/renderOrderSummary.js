// /scripts/renderOrderSummary.js
import { baseUrl } from "./constants.js";
import { formatCurrency } from "./utils/money.js";
import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import { renderPaymentSummary } from "./renderPaymentSummary.js";

const today = dayjs();
let isPaymentSummaryRendered = false; // Flag to prevent double rendering

// Generate HTML for delivery options with a default option selected if none is specified
function deliveryOptionsHTML(
  productId,
  deliveryOptions = [],
  selectedDeliveryOptionId = "2" // Default to the 7-day delivery option
) {
  let deliveryHTML = "";

  if (Array.isArray(deliveryOptions) && deliveryOptions.length > 0) {
    deliveryOptions.forEach((option) => {
      const dateString = today
        .add(option.deliveryDays, "days")
        .format("dddd, MMMM D");
      const priceString =
        option.priceCents === 0
          ? "FREE"
          : `KSH ${formatCurrency(option.priceCents)}`;
      const isChecked = option.id === selectedDeliveryOptionId ? "checked" : "";
      deliveryHTML += `
        <label class="delivery-option">
          <input type="radio" class="delivery-option-input" 
                 name="delivery-option-${productId}" 
                 data-product-id="${productId}" 
                 data-delivery-id="${option.id}" 
                 data-delivery-days="${option.deliveryDays}" 
                 value="${option.id}" 
                 ${isChecked}>
          <div>
            <div class="delivery-option-date">${dateString}</div>
            <div class="delivery-option-price">${priceString} Shipping</div>
          </div>
        </label>
      `;
    });
  } else {
    deliveryHTML = "<p>No delivery options available.</p>";
  }

  return deliveryHTML;
}

// Update the delivery date display based on the selected option
function updateDeliveryDate(productId, deliveryDays) {
  const deliveryDateElem = document.querySelector(
    `.js-delivery-date-${productId}`
  );
  const newDeliveryDate = today
    .add(deliveryDays, "days")
    .format("dddd, MMMM D");
  if (deliveryDateElem) {
    deliveryDateElem.textContent = `Delivery date: ${newDeliveryDate}`;
  }
}

// Attach event listeners to ensure quantity updates and delivery selections work correctly
function attachCartEventListeners(cart, products, deliveryOptions) {
  document.querySelectorAll(".js-quantity-select").forEach((select) => {
    select.addEventListener("change", async (event) => {
      const productId = event.target.dataset.productId;
      const newQuantity = parseInt(event.target.value, 10);
      await updateQuantity(productId, newQuantity);
      await renderOrderSummary(); // Refresh order and payment summaries
    });
  });

  document.querySelectorAll(".js-delete-quantity-link").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const productId = event.target.dataset.productId;
      await updateQuantity(productId, 0); // Set quantity to 0 to remove item
      await renderOrderSummary(); // Refresh order and payment summaries
    });
  });

  document.querySelectorAll(".delivery-option-input").forEach((input) => {
    input.addEventListener("change", () => {
      const productId = input.dataset.productId;
      const deliveryDays = parseInt(input.dataset.deliveryDays, 10);
      updateDeliveryDate(productId, deliveryDays);
      // Re-render payment summary with updated selections
      renderPaymentSummary(cart, products, deliveryOptions);
    });
  });
}

// Update cart quantity or delete item
async function updateQuantity(productId, newQuantity) {
  try {
    const method = newQuantity > 0 ? "PUT" : "DELETE";
    const url =
      newQuantity > 0
        ? `${baseUrl}/api/cart/update-cart`
        : `${baseUrl}/api/cart/remove-from-cart/${productId}`;
    const body =
      newQuantity > 0
        ? JSON.stringify({ productId, quantity: newQuantity })
        : null;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
      credentials: "include",
    });
  } catch (error) {
    console.error("Error updating quantity:", error);
  }
}

// Render the order summary and attach event listeners on page load
export async function renderOrderSummary() {
  try {
    const cartResponse = await fetch(`${baseUrl}/api/cart/get-cart`, {
      method: "GET",
      credentials: "include",
    });
    if (!cartResponse.ok) throw new Error("Failed to fetch cart data");

    const { cart, deliveryOptions = [] } = await cartResponse.json();

    if (!cart || cart.length === 0) {
      document.querySelector(".js-order-summary").innerHTML =
        "<p>Your cart is empty.</p>";
      renderPaymentSummary([], []); // Display empty payment summary
      return;
    }

    const productIds = cart.map((item) => item.productId);
    const productResponse = await fetch(
      `${baseUrl}/api/products/by-ids?ids=${productIds.join(",")}`
    );
    if (!productResponse.ok) throw new Error("Failed to fetch product details");

    const products = await productResponse.json();

    let cartSummaryHTML = "";
    cart.forEach((cartItem) => {
      const matchingProduct = products.find(
        (product) => product._id === cartItem.productId
      );
      if (matchingProduct) {
        cartSummaryHTML += `
          <div class="cart-item-container js-cart-item-container-${
            matchingProduct._id
          }">
            <!-- Delivery date positioned at the top-left -->
            <div class="delivery-date js-delivery-date-${matchingProduct._id}">
              Delivery date: ${today.add(7, "days").format("dddd, MMMM D")}
            </div>
            
            <div class="cart-item-details-grid">
              <img class="product-image" src="${matchingProduct.image}">
              <div class="cart-item-details">
                <div class="product-name">${matchingProduct.name}</div>
                <div class="product-price">KSH ${formatCurrency(
                  matchingProduct.priceCents
                )}</div>
                <div class="product-quantity">
                  <span>Quantity:</span>
                  <select class="quantity-select js-quantity-select" data-product-id="${
                    matchingProduct._id
                  }">
                    ${Array.from({ length: 10 }, (_, i) => {
                      const quantity = i + 1;
                      const selected =
                        quantity === cartItem.quantity ? "selected" : "";
                      return `<option value="${quantity}" ${selected}>${quantity}</option>`;
                    }).join("")}
                  </select>
                  <span class="delete-quantity-link link-primary js-delete-quantity-link" data-product-id="${
                    matchingProduct._id
                  }">Delete</span>
                </div>
              </div>
              <div class="delivery-options">
                <div class="delivery-options-title">Choose a delivery option:</div>
                ${deliveryOptionsHTML(
                  matchingProduct._id,
                  deliveryOptions,
                  cartItem.deliveryOptionId || "1"
                )}
              </div>
            </div>
          </div>
        `;
      }
    });

    document.querySelector(".js-order-summary").innerHTML = cartSummaryHTML;

    // Attach event listeners for quantity and delete actions
    attachCartEventListeners(cart, products, deliveryOptions);

    // Render the payment summary with updated data
    renderPaymentSummary(cart, products, deliveryOptions);
  } catch (error) {
    console.error("Error rendering cart summary:", error);
    document.querySelector(".js-order-summary").innerHTML =
      "<p>Error loading cart.</p>";
    renderPaymentSummary([], []); // Fallback in case of error
  }
}
