const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  comment: String,
  ts: { type: Date, default: Date.now },
  public: Boolean,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  commentedOn: {
    type: String,
  },
  objectType: String,
});

module.exports = commentSchema;
