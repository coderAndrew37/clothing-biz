const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOrderConfirmationEmail(to, order) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Order Confirmation",
    text: `Hello, ${order.name}. Thank you for your order! Your order is being processed.`,
    html: `<h3>Hello, ${order.name}</h3>
           <p>Thank you for your order! Your order is being processed and we will update you once it’s shipped.</p>
           <p><strong>Order Details:</strong></p>
           <ul>
              ${order.items
                .map(
                  (item) =>
                    `<li>${item.quantity} x ${item.name} - $${(
                      item.priceCents / 100
                    ).toFixed(2)}</li>`
                )
                .join("")}
           </ul>
           <p><strong>Total: $${(order.totalCents / 100).toFixed(
             2
           )}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendOrderConfirmationEmail;
