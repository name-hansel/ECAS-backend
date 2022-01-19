const mongoose = require("mongoose")

const FacultySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }, salutation: {
    type: String,
    required: true,
    enum: ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."],
    trim: true
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
  }, dateOfJoining: {
    type: Date
  }, department: {
    type: String,
    required: true,
    trim: true
  }, assignedCourses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    }, division: {
      type: String,
      required: true,
      trim: true,
    }
  }]
}, { timestamps: true })

module.exports = mongoose.model("Faculty", FacultySchema)