const mongoose = require("mongoose")

const FAQSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true
  }, questionAndAnswers: [{
    question: {
      type: String,
      // required: true,
      trim: true
    }, answer: {
      type: String,
      required: true,
      trim: true
    }
  }]
}, { timestamps: true })

module.exports = mongoose.model("FAQ", FAQSchema);