const mongoose = require("mongoose");
const Joi = require("joi");

// Define the lead schema
const leadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  quizAnswers: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Lead model
const Lead = mongoose.model("Lead", leadSchema);

// Validate lead data using Joi
function validateLead(lead) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    quizAnswers: Joi.object({
      q1: Joi.string().required(),
      q2: Joi.string().required(),
      q3: Joi.string().required(),
    }).required(),
  });
  return schema.validate(lead);
}

module.exports = {
  Lead,
  validateLead,
};
