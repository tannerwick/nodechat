const mongoose = require("mongoose");

let users = new mongoose.Schema({
  username: String,
  password: String,
  admin: Number
});

module.exports = mongoose.model("users", users);
