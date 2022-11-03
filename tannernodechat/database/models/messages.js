const mongoose = require("mongoose");

let messages = new mongoose.Schema({
  username: String,
  message: String,
  createdAt: Number,
  room: String,
});

module.exports = mongoose.model("messages", messages);
