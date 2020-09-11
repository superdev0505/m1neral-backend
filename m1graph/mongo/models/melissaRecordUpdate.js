const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const melissaRecordUpdateSchema = new Schema({
  melissaRecordType: {
    type: String,
    enum: ['main', 'address']
  },
  melissaRecord: {
    type: Schema.Types.ObjectId,
    ref: "MelissaRecord",
  },
  melissaAddressRecord: {
    type: Schema.Types.ObjectId,
    ref: "MelissaAddressRecord",
  },
  fieldName: String,
  oldValue: String,
  newValue: String,
  ts: { type: Date, default: Date.now },
  contact: {
    type: Schema.Types.ObjectId,
    ref: "Contact",
  },
});

module.exports = melissaRecordUpdateSchema;
