const mongoose = require("mongoose");

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
  }, semester: {
    type: Number,
    required: true
  }, branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  }, mandatory: {
    type: Boolean,
    required: true,
    default: true
  }, archived: {
    type: Boolean,
    required: true,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Course", CourseSchema);