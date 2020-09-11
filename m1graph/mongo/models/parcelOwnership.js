const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const parcelOwnershipSchema = new Schema({
  entity: String,
  type: String,
  depthFrom: String,
  depthTo: String,
  interest: String,
  nma: String,
  nra: String,
  ownerEntity: {
    type: Schema.Types.ObjectId,
    ref: "Entity",
  },
  customLayer: {
    type: Schema.Types.ObjectId,
    ref: "CustomLayer",
  },
  IsDeleted: { type: Boolean, default: false },
});

module.exports = parcelOwnershipSchema;
