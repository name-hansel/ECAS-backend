const mongoose = require("mongoose")

const BranchSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }, name: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true })

module.exports = mongoose.model("Branch", BranchSchema)