// Fetch and generate quiz from JSON
async function loadQuiz() {
  try {
    const response = await fetch("../data/quizData.json");
    const quizData = await response.json();

    // Set quiz title and description
    document.getElementById("quizTitle").textContent = quizData.quizTitle;
    document.getElementById("quizDescription").textContent =
      quizData.quizDescription;

    // Generate quiz questions
    const quizForm = document.getElementById("quizForm");
    quizData.questions.forEach((question) => {
      const questionDiv = document.createElement("div");
      questionDiv.classList.add("col-md-4");

      const label = document.createElement("label");
      label.classList.add("form-label");
      label.setAttribute("for", question.id);
      label.textContent = question.question;

      const select = document.createElement("select");
      select.classList.add("form-select");
      select.setAttribute("id", question.id);
      select.setAttribute("name", question.id);
      select.required = true;

      // Default option
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.disabled = true;
      defaultOption.selected = true;
      defaultOption.textContent = "Select one...";
      select.appendChild(defaultOption);

      // Populate options
      question.options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.toLowerCase().replace(" ", "-");
        optionElement.textContent = option;
        select.appendChild(optionElement);
      });

      // Invalid feedback
      const invalidFeedback = document.createElement("div");
      invalidFeedback.classList.add("invalid-feedback");
      invalidFeedback.textContent = `Please select an option for "${question.question}".`;

      // Append elements to questionDiv
      questionDiv.appendChild(label);
      questionDiv.appendChild(select);
      questionDiv.appendChild(invalidFeedback);
      quizForm.insertBefore(
        questionDiv,
        quizForm.querySelector(".submit-section")
      );
    });
  } catch (error) {
    console.error("Error loading quiz:", error);
  }
}

// Load quiz on page load
document.addEventListener("DOMContentLoaded", loadQuiz);
