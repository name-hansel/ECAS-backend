const mongoose = require("mongoose")

const ExamCellSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }, salutation: {
    type: String,
    required: true,
    enum: ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."], trim: true
  }, firstName: {
    type: String,
    trim: true
  }, lastName: {
    type: String,
    required: true,
    trim: true
  }, email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }, phoneNumber: {
    type: String, trim: true
  }
}, { timestamps: true })

module.exports = mongoose.model("ExamCell", ExamCellSchema)