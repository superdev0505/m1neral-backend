const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trackSchema = new Schema({
  ts: { type: Date, default: Date.now },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  objectType: String,
  trackOn: {
    type: String,
  },
});

module.exports = trackSchema;
