const mongoose = require("mongoose")

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  }, faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true
  }, course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  }, questionsFile: {
    type: String,
    required: true,
    trim: true
  }, numberOfQuestionsInQuiz: {
    type: Number,
    required: true
  }, rows: {
    type: Number,
    required: true
  }, columns: {
    type: Number,
    required: true
  }, numberOfStudents: {
    type: Number,
    required: true
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
  }
}, { timestamps: true });

module.exports = mongoose.model("Quiz", QuizSchema);