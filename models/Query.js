const mongoose = require("mongoose")

const QuerySchema = new mongoose.Schema({
  question: {
    type: String,
    trim: true,
    required: true
  }, answer: {
    type: String,
    trim: true
  }, askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  }, answeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamCell"
  }
}, { timestamps: true })

module.exports = mongoose.model("Query", QuerySchema);