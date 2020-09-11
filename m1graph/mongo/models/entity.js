const indexHelper = require("./cogSearch/indexHelper");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const entitySchema = new Schema({
  name: String,
  address1: String,
  address2: String,
  city: String,
  state: String,
  zip: String,
  country: String,

  globalOwner: String, //// Sql global owner id //optional
});

// methods to support index schema mapping
entitySchema.statics.indexMap = {
  _id: "id",
  __v: "v",
};

entitySchema.methods.toIndex = function () {
  return indexHelper.fieldMapper(
    this.toObject(),
    entitySchema.statics.indexMap
  );
};

module.exports = entitySchema;
