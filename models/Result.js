const mongoose = require("mongoose")

const ResultSchema = new mongoose.Schema({
  academicSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicSession",
    required: true
  }, semester: {
    type: Number,
    required: true
  }, student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  }, course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  }, faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true
  }, division: {
    type: String,
    required: true,
    trim: true
  }, results: [{
    examType: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "ExamType"
    }, marksObtained: {
      type: Number,
      required: true
    }
  }]
}, { timestamps: true })

module.exports = mongoose.model("Result", ResultSchema)