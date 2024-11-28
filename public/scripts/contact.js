import { baseUrl } from "./constants.js";

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.querySelector(".js-contact-form");
  const spinnerContainer = document.querySelector(".spinner-container");
  const formMessage = document.querySelector(".form-message");

  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Show spinner and hide previous message
      spinnerContainer.style.display = "flex";
      formMessage.style.display = "none";

      const formData = new FormData(contactForm);
      const formObject = Object.fromEntries(formData.entries());

      try {
        const response = await fetch(`${baseUrl}/api/contacts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formObject),
        });

        const result = await response.json();

        // Hide spinner and show message
        spinnerContainer.style.display = "none";
        formMessage.style.display = "block";

        if (response.ok) {
          formMessage.className = "form-message success";
          formMessage.textContent =
            result.message || "Message sent successfully!";
          contactForm.reset(); // Clear form fields after successful submission
        } else {
          formMessage.className = "form-message error";
          formMessage.textContent = result.message || "Failed to send message.";
        }
      } catch (error) {
        console.error("Error sending message:", error);
        formMessage.className = "form-message error";
        formMessage.textContent = "Failed to send message, try again later.";
        spinnerContainer.style.display = "none";
      }
    });
  }
});
