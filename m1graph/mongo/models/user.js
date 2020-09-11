const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: String,
  name: String,
  ts: { type: Date, default: Date.now },
});

module.exports = userSchema;
