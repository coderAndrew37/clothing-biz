import { renderProducts } from "./utils/renderUtils.js";
document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.querySelector(".js-search-button");
  const searchBar = document.querySelector(".js-search-bar");
  const suggestionsDropdown = document.querySelector(
    ".js-suggestions-dropdown"
  );

  searchButton.addEventListener("click", handleSearch);
  searchBar.addEventListener("input", handleSuggestions); // Trigger suggestions on input
  searchBar.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  });
});

async function handleSuggestions(event) {
  const query = event.target.value.trim();
  const suggestionsDropdown = document.querySelector(
    ".js-suggestions-dropdown"
  );

  if (query.length === 0) {
    suggestionsDropdown.innerHTML = ""; // Clear suggestions if input is empty
    return;
  }

  console.log("Searching suggestions for:", query); // Debugging log

  try {
    const suggestions = await fetchSuggestions(query);
    console.log("Fetched suggestions:", suggestions); // Debugging log

    if (suggestions.length > 0) {
      suggestionsDropdown.innerHTML = suggestions
        .map(
          (suggestion) =>
            `<div class="suggestion-item">${suggestion.name}</div>`
        )
        .join("");

      // Attach click event to each suggestion item
      document.querySelectorAll(".suggestion-item").forEach((item) => {
        item.addEventListener("click", () => {
          document.querySelector(".search-bar").value = item.textContent;
          handleSearch(); // Trigger search with selected suggestion
          suggestionsDropdown.innerHTML = ""; // Clear suggestions after selection
        });
      });
    } else {
      suggestionsDropdown.innerHTML = "<p>No suggestions found.</p>";
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    suggestionsDropdown.innerHTML = "<p>Error fetching suggestions.</p>";
  }
}

async function fetchSuggestions(query) {
  try {
    const response = await fetch(
      `/api/products/suggestions?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch suggestions");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : []; // Ensure data is an array
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}

async function handleSearch() {
  const searchTerm = document.querySelector(".search-bar").value.trim();
  const resultsContainer = document.querySelector(".js-products-grid");
  if (searchTerm) {
    resultsContainer.innerHTML = "<p>Loading results...</p>";
    try {
      const results = await searchProducts(searchTerm);
      if (Array.isArray(results) && results.length > 0) {
        renderProducts(results);
        document
          .querySelector("#featured-products")
          .scrollIntoView({ behavior: "smooth" }); // Smooth scroll to featured section
      } else {
        resultsContainer.innerHTML = "<p>No results found.</p>";
      }
    } catch (error) {
      console.error("Search failed:", error);
      resultsContainer.innerHTML =
        "<p>Error loading search results. Please try again later.</p>";
    }
  }
}

async function searchProducts(query) {
  try {
    const response = await fetch(
      `/api/products/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }
    const data = await response.json();
    return Array.isArray(data.products) ? data.products : [];
  } catch (error) {
    console.error("Error fetching search results:", error);
    return []; // Ensure an array is always returned
  }
}
