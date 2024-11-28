document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  const spinnerContainer = document.querySelector(".spinner-container");
  const formMessage = document.getElementById("formMessage");
  const submitButton = contactForm.querySelector(".submit-button");

  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Show spinner and disable button
      spinnerContainer.classList.remove("hidden");
      formMessage.classList.add("hidden");
      submitButton.textContent = "Sending...";
      submitButton.disabled = true;

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        spinnerContainer.classList.add("hidden");
        formMessage.classList.remove("hidden");

        if (response.ok) {
          formMessage.textContent =
            result.message || "Message sent successfully!";
          formMessage.className = "text-green-500";
          contactForm.reset();
        } else {
          formMessage.textContent = result.message || "Failed to send message.";
          formMessage.className = "text-red-500";
        }
      } catch (error) {
        formMessage.textContent = "An error occurred. Please try again.";
        formMessage.className = "text-red-500";
      } finally {
        // Re-enable the button
        submitButton.textContent = "Send Message";
        submitButton.disabled = false;
      }
    });
  }
});
