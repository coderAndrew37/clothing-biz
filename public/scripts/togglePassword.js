function togglePassword(inputId) {
  const passwordInput = document.getElementById(inputId);
  const toggleButton = passwordInput.nextElementSibling;

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleButton.innerHTML = "&#128083;"; // Closed eye icon
  } else {
    passwordInput.type = "password";
    toggleButton.innerHTML = "&#128065;"; // Open eye icon
  }
}
