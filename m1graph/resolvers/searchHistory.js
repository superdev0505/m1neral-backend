const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = (MongoDb) => ({
  Query: {
    getSearchHistory: async (_, { userId }) => {
      try {
        const allData = await MongoDb.SearchHistory.find({
          user: userId,
        }).exec();
        return allData;
      } catch (err) {
        return err;
      }
    },
  },

  Mutation: {
    addtSearchHistory: async (_, { searchHistory }) => {
      try {
        const newData = await MongoDb.SearchHistory.create(searchHistory);

        if (!newData)
          return {
            success: false,
            message: "failed to create",
          };
        return {
          success: true,
          message: "created",
          searchHistory: newData,
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to create",
          error: err,
        };
      }
    },
    updateSearchHistory: async (_, { searchId }) => {
      try {
        const newData = await MongoDb.SearchHistory.findByIdAndUpdate(
          searchId,
          { ts: Date.now() }
        );
        if (!newData)
          return {
            success: false,
            message: "failed to update",
          };
        return {
          success: true,
          message: "updated",
          searchHistory: newData,
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to update",
          error: err,
        };
      }
    },
    removeSearchHistory: async (_, { searchId }) => {
      try {
        const res = await MongoDb.SearchHistory.findOneAndRemove({
          _id: searchId,
        });
        if (!res)
          return {
            success: true,
            message: "It wasn't there",
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
  },
});
