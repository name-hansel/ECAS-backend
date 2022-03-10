const mongoose = require("mongoose")

const StudentSchema = new mongoose.Schema({
  admissionNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }, firstName: {
    type: String,
    required: true,
    trim: true
  }, middleName: {
    type: String,
    trim: true
  }, lastName: {
    type: String,
    required: true,
    trim: true
  }, branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true
  }, currentSemester: {
    type: Number,
    required: true
  }, currentDivision: {
    type: String,
    trim: true
  }, email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }, phoneNumber: {
    type: String,
    required: true,
    trim: true
  }, archived: {
    type: Boolean,
    required: true,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model("Student", StudentSchema)