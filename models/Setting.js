const mongoose = require("mongoose")

const SettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true
  }, value: {
    type: String,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model("Setting", SettingSchema)