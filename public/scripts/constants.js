const isProduction = window.location.hostname !== "localhost";
export const baseUrl = isProduction
  ? "https://clothing-biz.onrender.com"
  : "http://localhost:8000";
