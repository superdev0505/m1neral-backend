const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  email: String,
  fullname: String,
  phone: String,
  profileImage: String,
  displayname: String,
  timezone: String,
  activity: String,
  outlook_integrated: Boolean,
  ts: { type: Date, default: Date.now },
});

module.exports = profileSchema;
