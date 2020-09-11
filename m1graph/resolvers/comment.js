const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = (MongoDb) => ({
  Query: {
    comments: async () => {
      try {
        const allComments = await MongoDb.Comment.find({})
          .populate("user")
          .exec();
        return allComments;
      } catch (err) {
        return err;
      }
    },
    commentsByObjectId: async (_, { objectId }) => {
      try {
        const allComments = await MongoDb.Comment.find({
          commentedOn: objectId,
        })
          .populate("user")
          .exec();
        return allComments;
      } catch (err) {
        return err;
      }
    },
    commentsByObjectsIds: async (_, { objectsIdsArray, userId }) => {
      try {
        const tagsArray = await MongoDb.Comment.aggregate([
          {
            $match: {
              $and: [
                { commentedOn: { $in: objectsIdsArray } },
                {
                  $or: [
                    { public: true },
                    {
                      public: false,
                      user: ObjectId(userId),
                    },
                  ],
                },
              ],
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: "$user",
          },
          {
            $group: {
              _id: "$comment",
              comment: { $first: "$comment" },
              ids: { $addToSet: "$_id" },
              public: { $push: "$public" },
              user: { $addToSet: "$user" },
              ts: { $max: "$ts" },
              AllTs: { $addToSet: "$ts" },
              commentedOn: { $addToSet: "$commentedOn" },
            },
          },
          { $sort: { ts: -1 } },
        ]).exec();
        return tagsArray;
      } catch (err) {
        return err;
      }
    },
    commentsCounter: async (_, { objectsIdsArray, userId }) => {
      try {
        const countsArray = await MongoDb.Comment.aggregate([
          {
            $match: {
              $and: [
                { commentedOn: { $in: objectsIdsArray } },
                {
                  $or: [
                    { public: true },
                    {
                      public: false,
                      user: ObjectId(userId),
                    },
                  ],
                },
              ],
            },
          },

          {
            $group: {
              _id: "$commentedOn",
              total: { $sum: 1 },
            },
          },
        ]).exec();
        return countsArray;
      } catch (err) {
        return err;
      }
    },
  },
  Mutation: {
    upsertComment: async (_, { comment }) => {
      try {
        const newComment = await MongoDb.Comment.findOneAndUpdate(
          comment,
          { ts: Date.now() },
          {
            new: true,
            upsert: true,
          }
        );

        if (!newComment)
          return {
            success: false,
            message: "failed to create",
          };
        return {
          success: true,
          message: "updated",
          comment: newComment,
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to create",
          error: err,
        };
      }
    },
    removeComment: async (_, { commentId }) => {
      try {
        const res = await MongoDb.Comment.findOneAndRemove({ _id: commentId });
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
