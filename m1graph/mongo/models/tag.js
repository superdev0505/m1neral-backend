const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagSchema = new Schema({
  tag: String,
  ts: { type: Date, default: Date.now },
  public: Boolean,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  taggedOn: {
    type: String,
  },
  objectType: String,
});

module.exports = tagSchema;
