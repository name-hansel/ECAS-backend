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
  }, assignedCourses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    }, class: { // "SEM6 - A"
      type: String,
      required: true,
      trim: true,
    }, academicSession: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "AcademicSession"
    }
  }]
}, { timestamps: true })

module.exports = mongoose.model("Faculty", FacultySchema)