const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

module.exports = (MongoDb) => ({
  Query: {
    allEntityNamesToAddAsParcelOwner: async (_, { parcelId }) => {
      try {
        const entities = await MongoDb.Entity.aggregate([
          {
            $lookup: {
              from: "parcelownerships",
              localField: "_id",
              foreignField: "ownerEntity",
              as: "parcelownerships",
            },
          },
          {
            $match: {
              $and: [
                {
                  name: { $ne: null },
                },
                {
                  $or: [
                    {
                      $and: [
                        { "parcelownerships.IsDeleted": false },
                        {
                          "parcelownerships.customLayer": {
                            $ne: ObjectId(parcelId),
                          },
                        },
                      ],
                    },
                    { "parcelownerships._id": null },
                  ],
                },
              ],
            },
          },
          {
            $project: {
              _id: "$_id",
              name: "$name",
              address1: "$address1",
              address2: "$address2",
              city: "$city",
              state: "$state",
              zip: "$zip",
              country: "$country",
              // customLayers: "$parcelownerships.customLayer",
            },
          },
        ]);

        return entities;
      } catch (err) {
        return err;
      }
    },
  },
  Mutation: {
    // updateEntity: async (_, { entity }) => {
    //   try {
    //     let id = entity._id;
    //     delete entity._id;
    //     const res = await MongoDb.Entity.findOneAndUpdate(
    //       {
    //         _id: id,
    //       },
    //       entity,
    //       {
    //         new: true,
    //       }
    //     );
    //     if (!res)
    //       return {
    //         success: false,
    //         message: "failed to update",
    //       };
    //     return {
    //       success: true,
    //       message: "updated",
    //       entity: res,
    //     };
    //   } catch (err) {
    //     return {
    //       success: false,
    //       message: "failed to update",
    //       error: err,
    //     };
    //   }
    // },
  },
});
