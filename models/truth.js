const mongoose = require("mongoose");

const truthSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Truth", truthSchema);
