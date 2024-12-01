import { baseUrl } from "../constants.js";
import { addToCart, updateCartQuantity } from "../../data/cart.js";

// Check if the user is authenticated
export async function isAuthenticated() {
  try {
    const response = await fetch(`${baseUrl}/api/users/is-authenticated`, {
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

// Initialize Add to Cart listeners
export function initAddToCartListeners() {
  const buttons = document.querySelectorAll(".js-add-to-cart");

  buttons.forEach((button) => {
    // Remove any existing listeners
    const newButton = button.cloneNode(true);
    button.replaceWith(newButton);

    newButton.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      button.disabled = true;

      const productId = button.dataset.productId;
      if (!productId) {
        console.error("Missing productId for Add to Cart button.");
        button.disabled = false;
        return;
      }

      const isUserAuthenticated = await isAuthenticated();
      if (!isUserAuthenticated) {
        const proceedToLogin = confirm(
          "You must log in to add items to your cart. Would you like to log in now?"
        );
        if (proceedToLogin) {
          window.location.href = "/login.html";
        } else {
          alert("You cannot add items to the cart without logging in.");
        }
        button.disabled = false;
        return;
      }

      await handleAddToCart(productId, button); // Handle adding to cart
    });
  });
}

async function handleAddToCart(productId, button) {
  try {
    await addToCart(productId, 1);
    updateCartQuantity();

    // Show sweet "Added to Cart" message
    const addedMessage = button.parentElement.querySelector(".added-to-cart");
    if (addedMessage) {
      addedMessage.style.opacity = "1";
      setTimeout(() => {
        addedMessage.style.opacity = "0";
      }, 2000);
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    alert("Failed to add item to cart.");
  } finally {
    button.disabled = false;
  }
}
