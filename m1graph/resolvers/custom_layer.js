const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = (MongoDb) => ({
  Query: {
    customLayer: async (_, { id }) => {
      try {
        const layer = await MongoDb.CustomLayer.aggregate([
          {
            $match: {
              _id: ObjectId(id),
            },
          },
          {
            $lookup: {
              from: "parcelownerships",
              localField: "_id",
              foreignField: "customLayer",
              as: "owners",
            },
          },
          {
            $unwind: {
              path: "$owners",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "entities",
              localField: "owners.ownerEntity",
              foreignField: "_id",
              as: "owners.ownerEntity",
            },
          },
          {
            $unwind: {
              path: "$owners.ownerEntity",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "contacts",
              localField: "owners.ownerEntity._id",
              foreignField: "entity",
              as: "owners.isContact",
            },
          },
          {
            $unwind: {
              path: "$owners.isContact",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              "owners.isContact": "$owners.isContact._id",
            },
          },
          {
            $group: {
              _id: "$_id",
              shape: {
                $first: "$shape",
              },
              name: {
                $first: "$name",
              },
              layer: {
                $first: "$layer",
              },
              user: {
                $first: "$user",
              },
              county: {
                $first: "$county",
              },
              state: {
                $first: "$state",
              },
              Grid1: {
                $first: "$Grid1",
              },
              Grid2: {
                $first: "$Grid2",
              },
              Grid3: {
                $first: "$Grid3",
              },
              Grid4: {
                $first: "$Grid4",
              },
              Grid5: {
                $first: "$Grid5",
              },
              qtrQtr: {
                $first: "$qtrQtr",
              },
              grossAcres: {
                $first: "$grossAcres",
              },
              calcAcres: {
                $first: "$calcAcres",
              },
              legalDescription: {
                $first: "$legalDescription",
              },
              owners: {
                $push: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$owners", {}] },
                        {
                          $ne: ["$owners.IsDeleted", true],
                        },
                      ],
                    },
                    {
                      //// from entity
                      ownerEntityId: "$owners.ownerEntity._id",
                      name: "$owners.ownerEntity.name",
                      address1: "$owners.ownerEntity.address1",
                      address2: "$owners.ownerEntity.address2",
                      city: "$owners.ownerEntity.city",
                      state: "$owners.ownerEntity.state",
                      zip: "$owners.ownerEntity.zip",
                      country: "$owners.ownerEntity.country",
                      globalOwner: "$owners.ownerEntity.globalOwner",
                      //// from parcelOwnership
                      _id: "$owners._id",
                      entity: "$owners.entity",
                      type: "$owners.type",
                      depthFrom: "$owners.depthFrom",
                      depthTo: "$owners.depthTo",
                      interest: "$owners.interest",
                      nma: "$owners.nma",
                      nra: "$owners.nra",
                      IsDeleted: "$owners.IsDeleted",
                      //// for customLayer
                      customLayer: "$owners.customLayer",
                      //// from contact
                      isContact: {
                        $ifNull: ["$owners.isContact", false],
                      },
                    },
                    "$REMOVE",
                  ],
                },
              },
            },
          },
        ]);

        return layer[0];
      } catch (err) {
        return err;
      }
    },
    customLayers: async (_, { userId }) => {
      try {
        const allLayers = await MongoDb.CustomLayer.find({
          user: ObjectId(userId),
        })
          .populate("user")
          .exec();
        return allLayers;
      } catch (err) {
        return err;
      }
    },
    allCustomLayers: async () => {
      try {
        const allLayers = await MongoDb.CustomLayer.find({})
          .populate("user")
          .exec();
        return allLayers;
      } catch (err) {
        return err;
      }
    },
  },

  Mutation: {
    upsertCustomLayer: async (_, { customLayer }) => {
      try {
        const newCustomLayer = await MongoDb.CustomLayer.create(customLayer);
        if (!newCustomLayer)
          return {
            success: false,
            message: "failed to create",
          };
        return {
          success: true,
          message: "updated",
          customLayer: newCustomLayer,
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to create",
          error: err,
        };
      }
    },
    removeCustomLayer: async (_, { customLayerId }) => {
      try {
        const res = await MongoDb.CustomLayer.findOneAndRemove({
          _id: customLayerId,
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
    updateCustomLayer: async (_, { customLayerId, customLayer }) => {
      try {
        const res = await MongoDb.CustomLayer.findOneAndUpdate(
          {
            _id: customLayerId,
          },
          customLayer
        );
        if (!res)
          return {
            success: false,
            message: "failed to update",
          };
        return {
          success: true,
          message: "updated",
          customLayer: res, ///iqual to customLayer var
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
