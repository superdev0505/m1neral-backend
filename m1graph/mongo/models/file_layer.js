const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fileLayerSchema = new Schema({
  layerName: String,
  idColor: String,
  layerType: String,
  paintProps: JSON,
  file: {
    type: Schema.Types.ObjectId,
    ref: "File",
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = fileLayerSchema;
