const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Enums = require("../../common/enums");
const uuidv4 = require("uuid/v4");

const fileSchema = new Schema({
    name: { type: String },                         /* Name of the file with Extension */
    contentType: { type: String },                  /* ContentType to be served as MIME Type, might be handled with Storage Account */
    containerName : { type: String },               /* At Start can be tenant Name */
    fileUrl : { type: String, default: null},       /* Full File url */
    state: { type: typeof Enums.fileStateEnum , default: Enums.fileStateEnum.PENDING },  /* Default Pending until upload complete */
    internalKey : { type : String, default : uuidv4() },   /* Internal GUID to work accorss application */
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    tenant : { type: String },                      /* Future use */
    ts: { type: Date, default: Date.now },          /* TimeStamp */
});

module.exports = fileSchema;