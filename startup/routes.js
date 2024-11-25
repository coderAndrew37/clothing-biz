const products = require("../routes/products.js");
const auth = require("../routes/auth.js");
const cart = require("../routes/cart.js");
const passwordReset = require("../routes/passwordReset.js");
const faqs = require("../routes/faqs.js");
const contacts = require("../routes/contacts.js");
const quiz = require("../routes/quiz.js");
const newsletter = require("../routes/newsletter.js");
const orders = require("../routes/orders.js");
module.exports = function (app) {
  app.use("/api/products", products);
  app.use("/api/users", auth);
  app.use("/api/cart", cart);
  app.use("/api/password-reset", passwordReset);
  app.use("/api/faqs", faqs);
  app.use("/api/contacts", contacts);
  app.use("/api/submit-quiz", quiz); // Added the quiz route
  app.use("/api/newsletter", newsletter); // Added the newsletter route
  app.use("/api/orders", orders);
};
