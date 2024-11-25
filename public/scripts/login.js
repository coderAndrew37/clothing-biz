// login.js
import { baseUrl } from "./constants.js";

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${baseUrl}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Include cookies for token management
    });

    const data = await response.json();

    if (response.ok) {
      // Redirect to homepage on successful login
      window.location.href = "/";
    } else if (response.status === 401) {
      alert("Session expired. Please log in again.");
    } else if (response.status === 429) {
      alert("Too many login attempts. Please wait and try again.");
    } else {
      alert(data.message || "Login failed. Please check your credentials.");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("An error occurred. Please try again.");
  }
});
