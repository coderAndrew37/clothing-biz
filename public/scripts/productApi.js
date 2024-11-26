import { baseUrl as baseURL } from "./constants.js";
export async function loadCategoryProducts(categorySlug, page = 1, limit = 15) {
  try {
    const response = await fetch(
      `${baseURL}/api/products?category=${categorySlug}&page=${page}&limit=${limit}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to load category products: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching category products:", error);
    throw error;
  }
}
