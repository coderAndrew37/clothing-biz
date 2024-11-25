const Joi = require("joi");
const mongoose = require("mongoose");

const deliveryOptionSchema = new mongoose.Schema({
  id: String, // e.g., '1', '2', '3'
  deliveryDays: Number,
  priceCents: Number,
});

//validate the delivery shcema using joi

const deliveryOptionValidationSchema = Joi.object({
  id: Joi.string().required(),
  deliveryDays: Joi.number().required(),
  priceCents: Joi.number().required(),
});

const DeliveryOption = mongoose.model("DeliveryOption", deliveryOptionSchema);
module.exports = DeliveryOption;
