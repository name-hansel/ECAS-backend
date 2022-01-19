const mongoose = require("mongoose")

const CourseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }, name: {
    type: String,
    required: true,
    trim: true
  }, branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  }, semester: {
    type: Number,
    required: true
  }, examTypes: [{
    type: String,
    required: true,
    trim: true
  }]
}, { timestamps: true })

// ? Credits?
module.exports = mongoose.model("Course", CourseSchema)