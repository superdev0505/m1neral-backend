const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customLayerSchema = new Schema({
  shape: String,
  name: String,
  layer: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  county: String,
  state: String,
  Grid1: String,
  Grid2: String,
  Grid3: String,
  Grid4: String,
  Grid5: String,
  qtrQtr: Object,
  grossAcres: String,
  calcAcres: String,
  legalDescription: String,
});

module.exports = customLayerSchema;
