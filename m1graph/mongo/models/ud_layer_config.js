const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UDLayerConfigSchema = new Schema({
  config: JSON,
  layerName: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = UDLayerConfigSchema;
