const mongoose = require("mongoose");
const Joi = require("joi");

const ratingSchema = new mongoose.Schema({
  stars: { type: Number, required: true, min: 0, max: 5 },
  count: { type: Number, required: true, min: 0 },
});

// Define a schema for the base Product
const productSchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true, minlength: 3, maxlength: 100 },
  rating: { type: ratingSchema, required: true },
  priceCents: { type: Number, required: true, min: 0 },
  type: { type: String, default: "product" }, // Can be 'product' or 'clothing'
  sizeChartLink: { type: String }, // Optional for clothing type
  keywords: Array,
  categorySlug: { type: String, required: true }, // <--- Add this field to handle category slugs
});

// products model - add text index for search fields
productSchema.index({ name: "text", keywords: "text", categorySlug: "text" });

// Create a Mongoose model for Product
const Product = mongoose.model("Product", productSchema);

// Define a function for validating products using Joi
function validateProduct(product) {
  const schema = Joi.object({
    image: Joi.string().required(),
    name: Joi.string().min(3).max(100).required(),
    rating: Joi.object({
      stars: Joi.number().min(0).max(5).required(),
      count: Joi.number().min(0).required(),
    }).required(),
    priceCents: Joi.number().min(0).required(),
    type: Joi.string().valid("product", "clothing").optional(),
    sizeChartLink: Joi.when("type", {
      is: "clothing",
      then: Joi.string().required(),
      otherwise: Joi.string().optional(),
    }),
    keywords: Joi.array().items(Joi.string()).optional(), // Allow keywords as an optional array of strings
    categorySlug: Joi.string().required(), // <--- Add validation for categorySlug
  });

  return schema.validate(product);
}

// Use module.exports to export the objects
module.exports = {
  Product,
  validateProduct,
};
