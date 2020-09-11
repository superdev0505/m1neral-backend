const mongoose = require("mongoose");
const Enums = require("../common/enums");
const { ObjectId } = require("mongodb");
const storage = require("../common/storage");
const user = require("./user");
const tenant = require("../common/tenant");
const uuidv4 = require("uuid/v4");

module.exports = (MongoDb) => ({
    Query: {
        files: async (_, { userId }) => {
            try {
                var files = await MongoDb.File.find({
                    user: userId,
                    state: Enums.fileStateEnum.ACTIVE
                }).exec();

                return files;
            }
            catch (e) {
                return `unable to fetch list of files (${e})`;
            }
        },
        viewFile: async (_, { fileId }) => {
            try {
                var file = await MongoDb.File.findOne({
                    _id: fileId,
                    state: Enums.fileStateEnum.ACTIVE
                });

                if (!file) {
                    return "not found.";
                }

                var viewToken = storage.getViewToken(file.tenant,file.containerName, file.name);

                return {
                    id: file._id,
                    uri: viewToken.uri,
                    internalKey: file.internalKey
                }

            }
            catch (e) {
                return `unable to fetch file Data. (${e})`;
            }
        }
    },
    Mutation: {
        addFile: async (_, { fileName, userId }) => {
            try {
                if (fileName === undefined || userId === undefined)
                    return "error";
                
                var currentTenant = tenant.current(userId);
                var containerName = storage.getDefaultContainerName(currentTenant);

                // check if a file exists
                var file = await MongoDb.File.findOne({
                    name: fileName,
                    containerName: containerName
                }).exec();

                if (file) {
                    return `file ${fileName} already exists`;
                }

                file = await MongoDb.File.create({
                    name: fileName,
                    contentType: null,
                    containerName: containerName,
                    fileUrl: null,
                    state: Enums.fileStateEnum.PENDING,
                    user: ObjectId(userId),
                    tenant : currentTenant,
                    internalKey : uuidv4()
                });

                var uploadToken = storage.getUploadToken(currentTenant,containerName, fileName);

                return {
                    id: file._id,
                    uri: uploadToken.uri,
                    internalKey: file.internalKey
                }

            }
            catch (e) {
                return `failed to create new file (${e})`;
            }
        },
        updateFile: async (_, { fileId,userId }) => {
            try {
                if (fileId === undefined || userId === undefined)
                    return "error";
                
                var file = await MongoDb.File.findOne({
                    _id : ObjectId(fileId),
                    userId : ObjectId(userId)
                }).exec();

                if (!file) {
                    return `file ${fileName} not exists`; 
                }

                var uploadToken = storage.getUploadToken(file.tenant,file.containerName, file.name);

                return {
                    uri: uploadToken.uri,
                    internalKey: file.internalKey
                }
            }
            catch (e) {
                return `failed to update file (${e})`;
            }
        }
    }
});