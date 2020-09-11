const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  allData: Object,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = transactionSchema;
