const indexHelper = require("./cogSearch/indexHelper");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activityLogSchema = new Schema({
  type: String,
  notes: String,
  dateTime: String,
  user_id: String,
  fullname: String,
});

const contactSchema = new Schema({
  // name: String,
  // address1: String,
  // address2: String,
  // city: String,
  // state: String,
  // zip: String,
  // country: String,
  mobilePhone: String,
  homePhone: String,
  primaryEmail: String,
  leadStage: String,
  lastUpdateLeadStageAt: { type: Date, default: Date.now },
  activityLog: [activityLogSchema],

  // owners: [String],
  createAt: { type: Date, default: Date.now },
  createBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  lastUpdateAt: { type: Date, default: Date.now },
  lastUpdateBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  address1Alt: String,
  address2Alt: String,
  cityAlt: String,
  stateAlt: String,
  zipAlt: String,
  countryAlt: String,
  AltPhone: String,
  secondaryEmail: String,

  relatives: String,
  linkedln: String,
  facebook: String,
  twitter: String,
  leadSource: String,
  companyName: String,
  jobTitle: String,

  IsDeleted: { type: Boolean, default: false },
  entity: {
    type: Schema.Types.ObjectId,
    ref: "Entity",
  },
});

// methods to support index schema mapping
contactSchema.statics.indexMap = {
  _id: "id",
  createBy: "createBy",
  lastUpdateBy: "lastUpdateBy",
  createAt: "createAt",
  lastUpdateAt: "lastUpdateAt",
  entity: "entity",
  __v: "v",
};

contactSchema.methods.toIndex = function () {
  return indexHelper.fieldMapper(
    this.toObject(),
    contactSchema.statics.indexMap
  );
};

module.exports = contactSchema;
