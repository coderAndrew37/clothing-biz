document
  .getElementById("newsletterForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("newsletterEmail").value;
    const messageDiv = document.getElementById("newsletterMessage");

    messageDiv.textContent = "Subscribing...";
    messageDiv.style.color = "#333";

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.style.color = "#28a745";
        document.getElementById("newsletterForm").reset();
      } else {
        messageDiv.textContent = result.message || "Subscription failed.";
        messageDiv.style.color = "#dc3545";
      }
    } catch (error) {
      messageDiv.textContent = "An error occurred. Please try again.";
      messageDiv.style.color = "#dc3545";
    }
  });
