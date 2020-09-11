const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = (MongoDb) => ({
  Query: {
    publicTags: async () => {
      try {
        const allTags = await MongoDb.Tag.find({ public: true })
          .distinct("tag")
          .exec();
        return allTags;
      } catch (err) {
        return err;
      }
    },
    userAvailableTags: async (_, { userId }) => {
      try {
        const allTags = await MongoDb.Tag.find({
          $or: [{ public: true }, { public: false, user: userId }],
        })
          .distinct("tag")
          .exec();
        return allTags;
      } catch (err) {
        return err;
      }
    },
    userAvailableFilterTags: async (_, { userId }) => {
      try {
        const allTags = await MongoDb.Tag.find({
          $and: [
            { $or: [{ objectType: "well" }, { objectType: "owner" }] },
            { $or: [{ public: true }, { public: false, user: userId }] },
          ],
        })
          .distinct("tag")
          .exec();
        return allTags;
      } catch (err) {
        return err;
      }
    },
    tagsByObjectId: async (_, { objectId }) => {
      try {
        const allTags = await MongoDb.Tag.find({
          taggedOn: objectId,
        })
          .populate("user")
          .exec();
        return allTags;
      } catch (err) {
        return err;
      }
    },
    tagsByObjectsIds: async (_, { objectsIdsArray, userId }) => {
      try {
        const tagsArray = await MongoDb.Tag.aggregate([
          {
            $match: {
              $and: [
                { taggedOn: { $in: objectsIdsArray } },
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
              _id: "$tag",
              tag: { $first: "$tag" },
              taggedOn: { $addToSet: "$taggedOn" },
              public: { $push: "$public" },
              ids: { $addToSet: "$_id" },
              user: { $addToSet: "$user" },
            },
          },
        ]).exec();
        return tagsArray;
      } catch (err) {
        return err;
      }
    },
    tagSamples: async (_, { objectsIdsArray, userId }) => {
      try {
        const samplesArray = await MongoDb.Tag.aggregate([
          {
            $match: {
              $and: [
                { taggedOn: { $in: objectsIdsArray } },
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
              _id: "$taggedOn",
              tags: { $push: "$tag" },
              total: { $sum: 1 },
            },
          },
          // { $project: { tags: { $slice: ["$tags", 3] },total:1 } },
        ]).exec();

        return samplesArray;
      } catch (err) {
        return err;
      }
    },
    objectsFromTagsArray: async (_, { objectType, tagsArray, userId }) => {
      try {
        const objectsIdsArray = await MongoDb.Tag.aggregate([
          {
            $match: {
              $and: [
                { objectType: objectType },
                { tag: { $in: tagsArray } },
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
              _id: "$taggedOn",
              objects: { $push: "$_id" },
            },
          },
          {
            $group: {
              _id: null,
              objects: { $push: "$_id" },
            },
          },
          { $project: { _id: 0, objects: 1 } },
        ]).exec();

        return objectsIdsArray &&
          objectsIdsArray.length > 0 &&
          objectsIdsArray[0].objects
          ? objectsIdsArray[0].objects
          : [];
      } catch (err) {
        return err;
      }
    },
  },

  Mutation: {
    upsertTag: async (_, { tag }) => {
      try {
        const newTag = await MongoDb.Tag.findOneAndUpdate(
          tag,
          { ts: Date.now() },
          {
            new: true,
            upsert: true,
          }
        );

        if (!newTag)
          return {
            success: false,
            message: "failed to create",
          };
        return {
          success: true,
          message: "updated",
          tag: newTag,
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to create",
          error: err,
        };
      }
    },
    removeTag: async (_, { tagId }) => {
      try {
        const res = await MongoDb.Tag.findOneAndRemove({ _id: tagId });
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
