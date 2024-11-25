import { baseUrl as baseURL } from "../scripts/constants.js";

// Array to store products
export let products = [];

// Asynchronous function to fetch products from the API with pagination support
export async function loadProducts(page = 1) {
  const apiUrl = `${baseURL}/api/products?page=${page}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Ensure we have an array of products
    if (!data.products || !Array.isArray(data.products)) {
      throw new TypeError(
        "API response is missing or products is not an array."
      );
    }

    // Populate `products` array based on the API response
    products = data.products.map((productDetails) =>
      productDetails.type === "clothing"
        ? new Clothing(productDetails)
        : new Product(productDetails)
    );

    return {
      products: products,
      totalPages: data.totalPages, // Receive totalPages from API response
      currentPage: data.currentPage,
      totalProducts: data.totalProducts,
    };
  } catch (error) {
    console.error("Failed to load products:", error);
    throw error;
  }
}

// Helper function to format the product price in Kenyan Shillings
export function formatCurrency(priceCents) {
  return `KSH ${(priceCents / 100).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Product class definition
export class Product {
  constructor(productDetails) {
    this.id = productDetails._id;
    this.image = productDetails.image;
    this.name = productDetails.name;
    this.rating = productDetails.rating;
    this.priceCents = productDetails.priceCents;
  }

  // Get URL for star rating image
  getStarUrl() {
    return `/images/ratings/rating-${this.rating.stars * 10}.png`;
  }

  // Get formatted price
  getPrice() {
    return formatCurrency(this.priceCents);
  }

  // Additional info HTML (empty by default)
  extraInfoHtml() {
    return ``;
  }
}

// Clothing subclass extending Product for products with a size chart
export class Clothing extends Product {
  constructor(productDetails) {
    super(productDetails); // Call parent constructor
    this.sizeChartLink = productDetails.sizeChartLink; // Add specific property
  }

  // Override extraInfoHtml method to include size chart link
  extraInfoHtml() {
    return `<a href="${this.sizeChartLink}" target="_blank">Size Chart</a>`;
  }
}
