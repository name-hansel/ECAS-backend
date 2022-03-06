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
  }, credits: {
    type: Number,
    required: true
  }, examTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  }], archived: {
    type: Boolean,
    required: true,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model("Course", CourseSchema)