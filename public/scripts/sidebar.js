document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".js-sidebar");
  const overlay = document.querySelector(".js-overlay");
  const menuToggle = document.querySelector(".js-menu-toggle");
  const menuClose = document.querySelector(".js-menu-close");
  const menuIcon = menuToggle.querySelector("i"); // Target the icon inside the toggle button

  const openSidebar = () => {
    sidebar.classList.remove("sidebar-closed");
    sidebar.classList.add("sidebar-open");
    overlay.classList.add("overlay-active");

    // Change menu icon to close icon
    menuIcon.classList.remove("fa-bars");
    menuIcon.classList.add("fa-times");
  };

  const closeSidebar = () => {
    sidebar.classList.remove("sidebar-open");
    sidebar.classList.add("sidebar-closed");
    overlay.classList.remove("overlay-active");

    // Change close icon back to menu icon
    menuIcon.classList.remove("fa-times");
    menuIcon.classList.add("fa-bars");
  };

  // Toggle sidebar open and close
  menuToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("sidebar-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  // Toggle sidebar open and close with keyboard key press (Enter)
  menuToggle.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (sidebar.classList.contains("sidebar-open")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    }
  });

  // Close sidebar when close button or overlay is clicked
  menuClose?.addEventListener("click", closeSidebar); // Optional chaining for close button
  overlay.addEventListener("click", closeSidebar);
});
