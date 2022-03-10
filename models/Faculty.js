const mongoose = require("mongoose")

const FacultySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    trim: true,
    unique: true
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
  }, department: {
    type: String,
    required: true,
    trim: true
  }, archived: {
    type: Boolean,
    required: true,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model("Faculty", FacultySchema)