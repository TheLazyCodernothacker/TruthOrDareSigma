const mongoose = require("mongoose");

const dareSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Dare", dareSchema);
