const mongoose = require("mongoose")

const AcademicSessionSchema = new mongoose.Schema({
  from: {
    type: Number,
    required: true
  }, to: {
    type: Number,
    required: true
  }, session: {
    type: String,
    required: true,
    trim: true,
    enum: ["EVEN", "ODD"]
  }
}, { timestamps: true })

module.exports = mongoose.model("AcademicSession", AcademicSessionSchema)