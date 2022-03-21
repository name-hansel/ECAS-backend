const mongoose = require('mongoose')

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  }, description: {
    type: String,
    trim: true
  }, branch: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true
  }], year: [{
    type: Number,
    required: true
  }], attachments: [{
    type: String,
    trim: true,
    required: true
  }], addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamCell",
    required: true
  } //TODO notification field ?
}, { timestamps: true })

module.exports = mongoose.model("Notice", NoticeSchema)