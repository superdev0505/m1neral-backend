const mongoose = require("mongoose");
const getOnlyTheseFields = require("../shared/functions/getOnlyTheseFields");
const ObjectId = mongoose.Types.ObjectId;

module.exports = (MongoDb) => ({
  Query: {},
  Mutation: {
    addOwnerToAParcel: async (_, { parcelOwner }) => {
      try {
        let entity = getOnlyTheseFields(
          parcelOwner,
          [
            "ownerEntityId",
            "name",
            "address1",
            "address2",
            "city",
            "state",
            "zip",
            "country",
            "globalOwner",
          ],
          { ownerEntityId: "_id" }
        );

        let parcelOwnership = getOnlyTheseFields(parcelOwner, [
          "entity",
          "type",
          "depthFrom",
          "depthTo",
          "interest",
          "nma",
          "nra",
          "customLayer",
          "IsDeleted",
        ]);
        if (!entity._id) entity = await MongoDb.Entity.create(entity);

        if (entity && entity._id) {
          const newParcelOwnership = await MongoDb.ParcelOwnership.create({
            ...parcelOwnership,
            ownerEntity: entity._id,
          });

          if (newParcelOwnership)
            return {
              success: true,
              message: "Added",
            };
        }

        return {
          success: false,
          message: "failed to Add",
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to Add",
          error: err,
        };
      }
    },
    addParcelToAnEntity: async (_, { parcelInterest }) => {
      try {
        let customLayer = getOnlyTheseFields(
          parcelInterest,
          [
            "customLayer",
            "shape",
            "name",
            "layer",
            "user",
            "county",
            "state",
            "Grid1",
            "Grid2",
            "Grid3",
            "Grid4",
            "Grid5",
            "qtrQtr",
            "grossAcres",
            "calcAcres",
            "legalDescription",
          ],
          { customLayer: "_id" }
        );

        let parcelOwnership = getOnlyTheseFields(parcelInterest, [
          "entity",
          "type",
          "depthFrom",
          "depthTo",
          "interest",
          "nma",
          "nra",
          "ownerEntity",
          "IsDeleted",
        ]);
        if (!customLayer._id)
          customLayer = await MongoDb.CustomLayer.create(customLayer);

        if (customLayer && customLayer._id) {
          const newParcelOwnership = await MongoDb.ParcelOwnership.create({
            ...parcelOwnership,
            customLayer: customLayer._id,
          });

          if (newParcelOwnership)
            return {
              success: true,
              message: "Added",
            };
        }

        return {
          success: false,
          message: "failed to Add",
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to Add",
          error: err,
        };
      }
    },
    updateParcelOwner: async (_, { parcelOwner }) => {
      try {
        let entityId = parcelOwner.ownerEntityId;
        let entity = getOnlyTheseFields(parcelOwner, [
          "name",
          "address1",
          "address2",
          "city",
          "state",
          "zip",
          "country",
          "globalOwner",
        ]);
        let updatedOrNewEntity;
        //// if entity fields to updates or create
        if (Object.keys(entity).length > 0)
          if (entityId)
            //// update entity
            updatedOrNewEntity = await MongoDb.Entity.findOneAndUpdate(
              {
                _id: entityId,
              },
              entity,
              {
                new: true,
              }
            );
          else {
            //// create entity
            updatedOrNewEntity = await MongoDb.Entity.create(entity);
            if (updatedOrNewEntity && updatedOrNewEntity._id)
              entityId = updatedOrNewEntity._id;
          }

        let parcelOwnershipId = parcelOwner._id;
        let parcelOwnership = getOnlyTheseFields(parcelOwner, [
          "entity",
          "type",
          "depthFrom",
          "depthTo",
          "interest",
          "nma",
          "nra",
          "customLayer",
          "IsDeleted",
        ]);

        if (entityId) parcelOwnership.ownerEntity = entityId;
        let updatedParcelOwnership;
        if (parcelOwnershipId && Object.keys(parcelOwnership).length > 0)
          updatedParcelOwnership = await MongoDb.ParcelOwnership.findOneAndUpdate(
            {
              _id: parcelOwnershipId,
            },
            parcelOwnership,
            {
              new: true,
            }
          );

        if (!updatedOrNewEntity && !updatedParcelOwnership)
          return {
            success: false,
            message: "failed to update",
          };

        return {
          success: true,
          message: "updated",
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to update",
          error: err,
        };
      }
    },
    updateParcelOwnership: async (_, { parcelOwnership }) => {
      try {
        let id = parcelOwnership._id;
        delete parcelOwnership._id;

        const res = await MongoDb.ParcelOwnership.findOneAndUpdate(
          {
            _id: id,
          },
          parcelOwnership,
          {
            new: true,
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
          ownerInterest: res,
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
