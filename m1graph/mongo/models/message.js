const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  contact: {
    type: Schema.Types.ObjectId,
    ref: "Contact",
  },
  msgId: String,
  contactEmail: String,
  title: String,
  message: String,
  shortMsg: { type: String, default: "" },
  sendRecv: { type: Boolean, default: false },
  archive: { type: Boolean, default: false },
  receivedAt: { type: Date, default: Date.now },
});

module.exports = messageSchema;
