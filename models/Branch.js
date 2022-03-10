const mongoose = require("mongoose")

const BranchSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }, name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }, archived: {
    type: Boolean,
    required: true,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model("Branch", BranchSchema)