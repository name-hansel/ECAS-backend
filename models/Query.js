const mongoose = require("mongoose")

const QuerySchema = new mongoose.Schema({
  question: {
    title: {
      type: String,
      required: true,
      trim: true
    }, description: {
      type: String,
      trim: true
    }
  }, answer: {
    type: String,
    trim: true
  }, askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }, answeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamCell"
  }, answeredAt: {
    type: Date
  }
}, { timestamps: true })

module.exports = mongoose.model("Query", QuerySchema)