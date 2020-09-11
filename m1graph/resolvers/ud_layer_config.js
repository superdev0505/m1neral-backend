const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = (MongoDb) => ({
  Query: {
    layersConfigByUser: async (_, { userId }) => {
      try {
        const allLayers = await MongoDb.LayerConfig.find({
          user: ObjectId(userId),
        })
          .populate("user")
          .exec();
        return allLayers;
      } catch (err) {
        return err;
      }
    },
  },
  Mutation: {
    upsertLayerConfig: async (_, { layerConfig }) => {
      try {
        const newLayerConfig = await MongoDb.LayerConfig.create(layerConfig);
        if (!newLayerConfig)
          return {
            success: false,
            message: "failed to create",
          };
        return {
          success: true,
          message: "updated",
          layerConfig: newLayerConfig,
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to create",
          error: err,
        };
      }
    },
    removeLayerConfig: async (_, { layerConfigId }) => {
      try {
        const res = await MongoDb.LayerConfig.findOneAndRemove({
          _id: layerConfigId,
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
    updateLayerConfig: async (_, { layerConfigId, layerConfig }) => {
      try {
        const res = await MongoDb.LayerConfig.findOneAndUpdate(
          {
            _id: layerConfigId,
          },
          layerConfig,
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
          layerConfig: res, ///iqual to customLayer var
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
