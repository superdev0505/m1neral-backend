const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const layersStateSchema = new Schema({
  layersConfig: JSON,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = layersStateSchema;
