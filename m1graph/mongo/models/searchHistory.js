const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const searchHistory = new Schema({
  searchData: JSON,
  ts: { type: Date, default: Date.now },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = searchHistory;
