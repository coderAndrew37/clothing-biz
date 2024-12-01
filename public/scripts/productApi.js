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

    const data = await response.json();

    // Ensure `_id` is mapped to `id` for all products
    data.products = data.products.map((product) => ({
      ...product,
      id: product._id,
    }));

    return data;
  } catch (error) {
    console.error("Error fetching category products:", error);
    throw error;
  }
}
