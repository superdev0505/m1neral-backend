const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = (MongoDb) => ({
  Query: {
    layerStateByUser: async (_, { userId }) => {
      try {
        const layersState = await MongoDb.LayersState.findOne({
          user: ObjectId(userId),
        })
          .populate("user")
          .exec();
        return layersState;
      } catch (err) {
        return err;
      }
    },
  },
  Mutation: {
    upsertLayersState: async (_, { layerState }) => {
      try {
        const newLayerState = await MongoDb.LayersState.create(layerState);
        if (!newLayerState)
          return {
            success: false,
            message: "failed to create",
          };
        return {
          success: true,
          message: "created",
          layerState: newLayerState,
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to create",
          error: err,
        };
      }
    },
    removeLayersState: async (_, { userId }) => {
      try {
        const res = await MongoDb.LayersState.findOneAndRemove({
          user: userId,
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
    updateLayersState: async (_, { userId, layersState }) => {
      try {
        const res = await MongoDb.LayersState.findOneAndUpdate(
          {
            user: userId,
          },
          layersState,
          {upsert: true, new: true},
        );
        if (!res)
          return {
            success: false,
            message: "failed to update",
          };
        return {
          success: true,
          message: "updated",
          layerState: res, ///iqual to fileLayer var
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
