document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".js-sidebar");
  const menuToggle = document.querySelector(".js-menu-toggle");
  const authButton = document.querySelector(".js-auth-button");

  // Toggle sidebar visibility
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  async function isAuthenticated() {
    try {
      const response = await fetch("/api/users/is-authenticated", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      return data.authenticated;
    } catch (error) {
      console.error("Error checking authentication status:", error);
      return false;
    }
  }

  async function logout() {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  async function updateAuthButton() {
    const loggedIn = await isAuthenticated();
    authButton.textContent = loggedIn ? "Logout" : "Login";
    authButton.onclick = loggedIn ? handleLogout : handleLogin;

    // Set background color based on authentication state
    authButton.style.backgroundColor = loggedIn ? "red" : "blue";
  }

  function handleLogin() {
    window.location.href = "/login.html";
  }

  async function handleLogout() {
    await logout();
    updateAuthButton();
    window.location.href = "/";
  }

  updateAuthButton();
});
