const mongoose = require("mongoose")

const ExamTypeSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  }, name: {
    type: String,
    required: true,
    trim: true
  }, totalMarks: {
    type: Number,
    required: true
  }
})

module.exports = mongoose.model("ExamType", ExamTypeSchema)