const isProduction = window.location.hostname !== "localhost";
export const baseUrl = isProduction
  ? "https://quiz-cash.onrender.com"
  : "http://localhost:8000";
