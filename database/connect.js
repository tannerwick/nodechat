const mongoose = require("mongoose");

module.exports = async (client) => {
  mongoose
    .connect(
      process.env.mongo_uri,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: false,
      }
    )
    .then(() => {
      console.log("[!] Mongoose successfully connected.");
    })
    .catch((a) => console.log("[!] Mongoose failed to connect. " + a));
};
