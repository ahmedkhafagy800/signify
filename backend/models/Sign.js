const mongoose = require("mongoose");

const SignSchema = new mongoose.Schema({
  translation: { type: String, required: true },
  image: { type: String, required: true }, 
  iscommon : { type: Boolean, default: false },
});

module.exports = mongoose.model("Sign", SignSchema);