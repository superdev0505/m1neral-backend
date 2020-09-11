const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = (MongoDb) => ({
  Query: {
    fileLayers: async (_, { userId }) => {
      try {
        const allLayers = await MongoDb.FileLayer.find({
          user: ObjectId(userId),
        })
          .populate("user")
          .exec();
        return allLayers;
      } catch (err) {
        return err;
      }
    },
    allFileLayers: async () => {
      try {
        const allLayers = await MongoDb.FileLayer.find({})
          .populate("user")
          .populate("file")
          .exec();
        return allLayers;
      } catch (err) {
        return err;
      }
    },
    fileLayer: async (_, { id }) => {
      try {
        const layer = await MongoDb.FileLayer.findOne({
          _id: id,
        })
          .populate("user")
          .populate("file")
          .exec();

        return layer;
      } catch (err) {
        return err;
      }
    },
  },
  Mutation: {
    upsertFileLayer: async (_, { fileLayer }) => {
      try {
        const newFileLayer = await MongoDb.FileLayer.create(fileLayer);
        if (!newFileLayer)
          return {
            success: false,
            message: "failed to create",
          };
        return {
          success: true,
          message: "updated",
          fileLayer: newFileLayer,
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to create",
          error: err,
        };
      }
    },
    removeFileLayer: async (_, { fileLayerId }) => {
      try {
        const res = await MongoDb.FileLayer.findOneAndRemove({
          _id: fileLayerId,
        });
        if (!res)
          return {
            success: false,
            message: "failed to remove",
          };
        return {
          success: true,
          message: "removed",
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to remove",
          error: err,
        };
      }
    },
    updateFileLayer: async (_, { fileLayerId, fileLayer }) => {
      try {
        const res = await MongoDb.FileLayer.findOneAndUpdate(
          {
            _id: fileLayerId,
          },
          fileLayer,
          {
            returnNewDocument: true
          }
        );
        if (!res)
          return {
            success: false,
            message: "failed to update",
          };
        return {
          success: true,
          message: "updated",
          fileLayer: res, ///iqual to fileLayer var
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to update",
          error: err,
        };
      }
    },
  },
});
