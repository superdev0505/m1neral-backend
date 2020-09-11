const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const currentAddressSchema = new Schema({
  AddressLine1: String,
  Suite: String,
  City: String,
  State: String,
  PostalCode: String,
  Plus4: String,
  MelissaAddressKey: String,
  MelissaAddressKeyBase: String
});

const melissaAddressRecordSchema = new Schema({
  RecordID: String,
  Results: String,
  FullName: String,
  FirstName: String,
  MiddleName: String,
  LastName: String,
  CurrentAddress: currentAddressSchema,

  ts: { type: Date, default: Date.now },
  contact: {
    type: Schema.Types.ObjectId,
    ref: "Contact",
  },
});

module.exports = melissaAddressRecordSchema;
