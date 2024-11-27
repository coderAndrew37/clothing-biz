import { formatCurrency } from "./utils/money.js";

const TAX_RATE = 0.1;

function calculateProductTotal(cart = [], products = []) {
  return cart.reduce((total, cartItem) => {
    const matchingProduct = products.find(
      (product) => product._id === cartItem.productId
    );
    if (matchingProduct) {
      return total + matchingProduct.priceCents * cartItem.quantity;
    } else {
      console.warn(
        `Product not found for cart item with ID ${cartItem.productId}`
      );
      return total;
    }
  }, 0);
}

function calculateShippingTotal(cart = [], deliveryOptions = []) {
  return cart.reduce((total, cartItem) => {
    const selectedDeliveryInput = document.querySelector(
      `input[name="delivery-option-${cartItem.productId}"]:checked`
    );
    const selectedDeliveryOption = deliveryOptions.find(
      (option) => option.id === (selectedDeliveryInput?.value || "1")
    );
    if (selectedDeliveryOption) {
      return total + selectedDeliveryOption.priceCents;
    } else {
      console.warn(
        `Delivery option not found for cart item with ID ${cartItem.productId}`
      );
      return total;
    }
  }, 0);
}

function calculateEstimatedTax(totalBeforeTaxCents) {
  return totalBeforeTaxCents * TAX_RATE;
}

export function renderPaymentSummary(
  cart = [],
  products = [],
  deliveryOptions = []
) {
  const productTotalCents = calculateProductTotal(cart, products);
  const shippingTotalCents = calculateShippingTotal(cart, deliveryOptions);
  const totalBeforeTaxCents = productTotalCents + shippingTotalCents;
  const estimatedTaxCents = calculateEstimatedTax(totalBeforeTaxCents);
  const totalCents = totalBeforeTaxCents + estimatedTaxCents;

  const paymentSummaryHTML = `
    <div class="payment-summary-title">Order Summary</div>
    <div class="payment-summary-row">
        <div>Items (${cart.length}):</div>
        <div class="payment-summary-money">Ksh ${formatCurrency(
          productTotalCents
        )}</div>
    </div>
    <div class="payment-summary-row">
        <div>Shipping & handling:</div>
        <div class="payment-summary-money">Ksh ${formatCurrency(
          shippingTotalCents
        )}</div>
    </div>
    <div class="payment-summary-row subtotal-row">
        <div>Total before tax:</div>
        <div class="payment-summary-money">Ksh ${formatCurrency(
          totalBeforeTaxCents
        )}</div>
    </div>
    <div class="payment-summary-row">
        <div>Estimated tax (${TAX_RATE * 100}%):</div>
        <div class="payment-summary-money">Ksh ${formatCurrency(
          estimatedTaxCents
        )}</div>
    </div>
    <div class="payment-summary-row total-row">
        <div>Order total:</div>
        <div class="payment-summary-money">Ksh ${formatCurrency(
          totalCents
        )}</div>
    </div>
    <button class="place-order-button button-primary js-place-order-button">
      Place your order
    </button>
  `;

  document.querySelector(".js-payment-summary").innerHTML = paymentSummaryHTML;

  // Return totalCents to use in the order submission
  return totalCents;
}
