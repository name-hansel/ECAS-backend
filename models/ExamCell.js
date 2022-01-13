const mongoose = require("mongoose")

const ExamCellSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  }, salutation: {
    type: String,
    required: true,
    enum: ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."]
  }, firstName: {
    type: String,
    required: true
  }, lastName: {
    type: String,
    required: true
  }, email: {
    type: String,
    required: true
  }, phoneNumber: {
    type: String,
  }
}, { timestamps: true })

module.exports = mongoose.model("ExamCell", ExamCellSchema)