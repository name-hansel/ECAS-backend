const mongoose = require("mongoose")

const SeatingArrangementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }, dateOfExam: {
    type: Date,
    required: true
  }, studentFile: {
    type: String,
    trim: true
  }, roomFile: {
    type: String,
    trim: true
  }, courseFile: {
    type: String,
    trim: true
  }, complete: {
    type: Boolean,
    default: false,
    required: true
  }, failed: {
    type: Boolean,
    default: false,
    required: true
  }, threadId: {
    type: Number,
  }, solutionFile: {
    type: String,
    trim: true
  }, createdByEmail: {
    type: String,
    trim: true,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model("SeatingArrangement", SeatingArrangementSchema)