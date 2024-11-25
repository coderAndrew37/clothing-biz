document
  .getElementById("quizForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector("button[type='submit']");

    // Reset error message display
    document.getElementById("submissionError").style.display = "none";

    // Check if form is valid
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    // Show loading state on submit button
    submitButton.textContent = "Sending...";
    submitButton.disabled = true;

    // Gather answers from form fields
    const formData = new FormData(form);
    const quizAnswers = {
      q1: formData.get("q1"),
      q2: formData.get("q2"),
      q3: formData.get("q3"),
    };
    const email = formData.get("email");

    const payload = { email, quizAnswers };

    try {
      const response = await fetch("/api/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        // Show the quiz results, hide the form
        document.getElementById("quizResults").style.display = "block";
        document.getElementById("resultText").textContent =
          result.recommendation;
        form.style.display = "none"; // Hide quiz form
      } else {
        displayError(result.error || "Submission failed. Please try again.");
      }
    } catch (error) {
      displayError(
        "An error occurred. Please check your connection and try again."
      );
    } finally {
      // Reset button text after submission process completes
      submitButton.textContent = "See Suggestions";
      submitButton.disabled = false;
    }
  });

// Handle "Continue" button to return to the quiz form
document
  .getElementById("continueButton")
  .addEventListener("click", function () {
    // Hide recommendation and show the quiz form
    document.getElementById("quizResults").style.display = "none";
    document.getElementById("quizForm").style.display = "block";

    // Optionally reset the form to allow fresh input
    document.getElementById("quizForm").reset();
    document.getElementById("quizForm").classList.remove("was-validated");
  });

// Helper function to display error messages
function displayError(message) {
  const errorDiv = document.getElementById("submissionError");
  errorDiv.style.display = "block";
  errorDiv.textContent = message;
}
