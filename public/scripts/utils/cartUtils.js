// /utils/cartUtils.js
/*
export async function updateCartQuantityUI() {
  try {
    const response = await fetch("/api/cart/get-cart", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch cart data");

    const { cart } = await response.json();
    const cartQuantity = cart.reduce((total, item) => total + item.quantity, 0);

    // Update UI elements with cart quantity
    document.querySelector(".js-cart-quantity")?.textContent = cartQuantity;
    document.querySelector(".return-to-home-link")?.textContent = `Checkout (${cartQuantity} items)`;
  } catch (error) {
    console.error("Error updating cart quantity:", error);
  }
}
*/
