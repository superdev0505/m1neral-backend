const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const {
  SearchClient,
  SearchIndexClient,
  SearchServiceClient,
  AzureKeyCredential,
} = require("@azure/search-documents");
const getOnlyTheseFields = require("../shared/functions/getOnlyTheseFields");
const deepEqualObjects = require("../shared/functions/deepEqualObjects");

// To query and manipulate documents
const searchClient = new SearchClient(
  "https://m1neral.search.windows.net",
  "contact-index",
  new AzureKeyCredential("2665BC71FCE611D6AF2893AAEC414848")
);

module.exports = (MongoDb) => ({
  Query: {
    contacts: async () => {
      try {
        const allContacts = await MongoDb.Contact.aggregate([
          {
            $match: { IsDeleted: false },
          },
          {
            $lookup: {
              from: "entities",
              localField: "entity",
              foreignField: "_id",
              as: "entity",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "lastUpdateBy",
              foreignField: "_id",
              as: "lastUpdateBy",
            },
          },
          {
            $unwind: {
              path: "$entity",
            },
          },
          {
            $unwind: {
              path: "$lastUpdateBy",
            },
          },
          {
            $project: {
              _id: "$_id",
              mobilePhone: "$mobilePhone",
              homePhone: "$homePhone",
              primaryEmail: "$primaryEmail",
              leadSource: "$leadSource",
              lastUpdateAt: "$lastUpdateAt",
              lastUpdateLeadStageAt: "$lastUpdateLeadStageAt",
              lastUpdateBy: "$lastUpdateBy",
              //// from entity
              entity: "$entity._id",
              name: "$entity.name",
              address1: "$entity.address1",
              address2: "$entity.address2",
              city: "$entity.city",
              state: "$entity.state",
              zip: "$entity.zip",
              country: "$entity.country",
              globalOwner: "$entity.globalOwner",
            },
          },
        ]);

        return allContacts;
      } catch (err) {
        return err;
      }
    },
    contact: async (_, { contactId }) => {
      try {
        const contact = await MongoDb.Contact.aggregate([
          {
            $match: {
              _id: ObjectId(contactId),
              IsDeleted: false,
            },
          },
          {
            $lookup: {
              from: "entities",
              localField: "entity",
              foreignField: "_id",
              as: "entity",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "lastUpdateBy",
              foreignField: "_id",
              as: "lastUpdateBy",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "createBy",
              foreignField: "_id",
              as: "createBy",
            },
          },
          {
            $unwind: {
              path: "$entity",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: "$lastUpdateBy",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: "$createBy",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: "$activityLog",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "profiles",
              localField: "activityLog.user_id",
              foreignField: "email",
              as: "activityLog.profile",
            },
          },
          {
            $unwind: {
              path: "$activityLog.profile",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              "activityLog.fullname": "$activityLog.profile.fullname",
            },
          },
          {
            $group: {
              _id: "$_id",
              mobilePhone: { $first: "$mobilePhone" },
              homePhone: { $first: "$homePhone" },
              primaryEmail: { $first: "$primaryEmail" },
              activityLog: {
                $push: {
                  $cond: [
                    { $ne: ["$activityLog", {}] },
                    {
                      _id: "$activityLog._id",
                      dateTime: "$activityLog.dateTime",
                      notes: "$activityLog.notes",
                      type: "$activityLog.type",
                      user_id: "$activityLog.user_id",
                      fullname: "$activityLog.fullname",
                    },
                    "$REMOVE",
                  ],
                },
              },
              leadSource: { $first: "$leadSource" },
              createAt: { $first: "$createAt" },
              createBy: { $first: "$createBy" },
              lastUpdateAt: { $first: "$lastUpdateAt" },
              lastUpdateBy: { $first: "$lastUpdateBy" },
              address1Alt: { $first: "$address1Alt" },
              address2Alt: { $first: "$address2Alt" },
              lastUpdateLeadStageAt: { $first: "$lastUpdateLeadStageAt" },
              leadStage: { $first: "$leadStage" },
              cityAlt: { $first: "$cityAlt" },
              stateAlt: { $first: "$stateAlt" },
              zipAlt: { $first: "$zipAlt" },
              countryAlt: { $first: "$countryAlt" },
              AltPhone: { $first: "$AltPhone" },
              secondaryEmail: { $first: "$secondaryEmail" },
              relatives: { $first: "$relatives" },
              linkedln: { $first: "$linkedln" },
              facebook: { $first: "$facebook" },
              twitter: { $first: "$twitter" },
              companyName: { $first: "$companyName" },
              jobTitle: { $first: "$jobTitle" },
              IsDeleted: { $first: "$IsDeleted" },
              name: { $first: "$entity.name" },
              address1: { $first: "$entity.address1" },
              address2: { $first: "$entity.address2" },
              city: { $first: "$entity.city" },
              state: { $first: "$entity.state" },
              zip: { $first: "$entity.zip" },
              country: { $first: "$entity.country" },
              globalOwner: { $first: "$entity.globalOwner" },
              entity: { $first: "$entity._id" },
            },
          },
        ]);

        return contact[0];
      } catch (err) {
        return err;
      }
    },
    contactParcelInterests: async (_, { contactId }) => {
      try {
        const contact = await MongoDb.Contact.aggregate([
          {
            $match: {
              _id: ObjectId(contactId),
              IsDeleted: false,
            },
          },
          {
            $lookup: {
              from: "entities",
              localField: "entity",
              foreignField: "_id",
              as: "entity",
            },
          },
          {
            $unwind: {
              path: "$entity",
              preserveNullAndEmptyArrays: true,
            },
          },
          // {
          //   $project: {
          //     _id: "$_id",
          //     entityId: "$entity._id",
          //   },
          // },
          {
            $lookup: {
              from: "parcelownerships",
              localField: "entity._id",
              foreignField: "ownerEntity",
              as: "parcelOwnerships",
            },
          },
          {
            $unwind: {
              path: "$parcelOwnerships",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              $and: [
                { parcelOwnerships: { $ne: {} } },
                {
                  "parcelOwnerships.IsDeleted": false,
                },
              ],
            },
          },
          {
            $lookup: {
              from: "customlayers",
              localField: "parcelOwnerships.customLayer",
              foreignField: "_id",
              as: "parcelOwnerships.customLayer",
            },
          },
          {
            $unwind: {
              path: "$parcelOwnerships.customLayer",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: "$parcelOwnerships._id",
              IsDeleted: "$parcelOwnerships.IsDeleted",
              // entity: "$parcelOwnerships.entity",
              // type: "$parcelOwnerships.type",
              depthFrom: "$parcelOwnerships.depthFrom",
              depthTo: "$parcelOwnerships.depthTo",
              interest: "$parcelOwnerships.interest",
              nma: "$parcelOwnerships.nma",
              nra: "$parcelOwnerships.nra",
              ownerEntityId: "$parcelOwnerships.ownerEntity",
              //// from customLayer
              customLayerId: "$parcelOwnerships.customLayer._id",
              customLayerName: "$parcelOwnerships.customLayer.name",
              customLayerState: "$parcelOwnerships.customLayer.state",
              customLayerCounty: "$parcelOwnerships.customLayer.county",
              Grid1: "$parcelOwnerships.customLayer.Grid1",
              Grid2: "$parcelOwnerships.customLayer.Grid2",
              Grid3: "$parcelOwnerships.customLayer.Grid3",
              Grid4: "$parcelOwnerships.customLayer.Grid4",
              Grid5: "$parcelOwnerships.customLayer.Grid5",
            },
          },
        ]);

        return contact;
      } catch (err) {
        return err;
      }
    },
    // contactsByOwnerId: async (_, { objectId }) => {
    //   try {
    //     const allContacts = await MongoDb.Contact.find(
    //       {
    //         owners: objectId,
    //         $or: [{ IsDeleted: false }, { IsDeleted: null }],
    //       },
    //       "name address1 address2 city state zip country mobilePhone homePhone primaryEmail leadSource lastUpdateAt lastUpdateBy"
    //     )
    //       .populate("createBy")
    //       .populate("lastUpdateBy")
    //       .exec();
    //     return allContacts;
    //   } catch (err) {
    //     return err;
    //   }
    // },
    // contactsCounter: async (_, { objectsIdsArray }) => {
    //   try {
    //     const countsArray = await MongoDb.Contact.aggregate([
    //       { $unwind: "$owners" },
    //       {
    //         $match: {
    //           $and: [
    //             { owners: { $in: objectsIdsArray } },
    //             { $or: [{ IsDeleted: false }, { IsDeleted: null }] },
    //           ],
    //         },
    //       },
    //       {
    //         $group: {
    //           _id: "$owners",
    //           total: { $sum: 1 },
    //         },
    //       },
    //     ]).exec();
    //     return countsArray;
    //   } catch (err) {
    //     return err;
    //   }
    // },
  },
  Mutation: {
    // addRemoveOwnerToAContact: async (_, { contactId, ownerId }) => {
    //   try {
    //     let found = await MongoDb.Contact.updateOne(
    //       {
    //         _id: contactId,
    //       },
    //       { $pull: { owners: ownerId } },
    //       { multi: true }
    //     );

    //     if (found && found.n !== 0) {
    //       if (found.nModified !== 0) {
    //         found = await MongoDb.Contact.findOne({
    //           _id: contactId,
    //         }).exec();
    //       } else {
    //         found = await MongoDb.Contact.findOneAndUpdate(
    //           {
    //             _id: contactId,
    //           },
    //           { $push: { owners: ownerId } },
    //           { new: true }
    //         );
    //       }

    //       (async () => {
    //         const uploadResult = await searchClient.mergeOrUploadDocuments([
    //           found.toIndex(),
    //         ]);
    //         for await (const result of uploadResult.results) {
    //           console.log(
    //             `Uploaded ${result.key}; succeeded? ${result.succeeded}`
    //           );
    //         }
    //       })();

    //       return {
    //         success: true,
    //         message: "updated",
    //         contact: found,
    //       };
    //     }

    //     return {
    //       success: false,
    //       message: "failed to update",
    //     };
    //   } catch (err) {
    //     return {
    //       success: false,
    //       message: "failed to update",
    //       error: err,
    //     };
    //   }
    // },
    addContact: async (_, { contact }) => {
      try {
        let entity = getOnlyTheseFields(
          contact,
          [
            "entity",
            "name",
            "address1",
            "address2",
            "city",
            "state",
            "zip",
            "country",
            "globalOwner",
          ],
          { entity: "_id" }
        );

        let mongoContact = getOnlyTheseFields(contact, [
          "mobilePhone",
          "homePhone",
          "primaryEmail",
          "activityLog",
          "leadStage",
          "createBy",
          "lastUpdateBy",
          "address1Alt",
          "address2Alt",
          "cityAlt",
          "stateAlt",
          "zipAlt",
          "countryAlt",
          "AltPhone",
          "secondaryEmail",
          "relatives",
          "linkedln",
          "facebook",
          "twitter",
          "leadSource",
          "companyName",
          "jobTitle",
        ]);
        if (!entity._id) {
          entity = await MongoDb.Entity.create(entity);
          entity = entity.toObject();
        }

        if (entity && entity._id) {
          let newMongoContact = await MongoDb.Contact.create({
            ...mongoContact,
            entity: ObjectId(entity._id),
          });
          newMongoContact = newMongoContact.toObject();

          if (newMongoContact) {
            delete entity._id;
            delete entity._v;
            const newWholeContact = { ...newMongoContact, ...entity };

            (async () => {
              const uploadResult = await searchClient.uploadDocuments([
                newWholeContact.toIndex(),
              ]);
              for await (const result of uploadResult.results) {
                console.log(
                  `Uploaded ${result.key}; succeeded? ${result.succeeded}`
                );
              }
            })();

            return {
              success: true,
              message: "Added",
              contact: newWholeContact,
            };
          }
        }

        return {
          success: false,
          message: "failed to Add",
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to create",
          error: err,
        };
      }
    },
    updateContact: async (_, { contact, ignoreResponse }) => {
      try {
        let entityId = contact.entity;
        let entity = getOnlyTheseFields(contact, [
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
        if (Object.keys(entity).length > 0) {
          if (entityId)
            //// update entity
            updatedOrNewEntity = await MongoDb.Entity.findOneAndUpdate(
              {
                _id: ObjectId(entityId),
              },
              entity,
              {
                new: true,
              }
            );
          //// create entity
          else updatedOrNewEntity = await MongoDb.Entity.create(entity);
          updatedOrNewEntity = updatedOrNewEntity.toObject();
        }

        let mongoContacId = contact._id;
        let mongoContact = getOnlyTheseFields(contact, [
          "mobilePhone",
          "homePhone",
          "primaryEmail",
          "activityLog",
          "createBy",
          "lastUpdateBy",
          "address1Alt",
          "address2Alt",
          "cityAlt",
          "stateAlt",
          "zipAlt",
          "countryAlt",
          "AltPhone",
          "secondaryEmail",
          "relatives",
          "linkedln",
          "facebook",
          "twitter",
          "leadSource",
          "leadStage",
          "lastUpdateLeadStageAt",
          "companyName",
          "jobTitle",
          "IsDeleted",
        ]);

        if (updatedOrNewEntity && updatedOrNewEntity._id != entityId)
          mongoContact.entity = updatedOrNewEntity._id;

        let updatedMongoContact;
        if (
          mongoContacId &&
          (Object.keys(mongoContact).length > 0 || updatedOrNewEntity)
        ) {
          mongoContact.lastUpdateAt = Date.now();
          updatedMongoContact = await MongoDb.Contact.findOneAndUpdate(
            {
              _id: ObjectId(mongoContacId),
            },
            mongoContact,
            {
              new: true,
            }
          );
          updatedMongoContact = updatedMongoContact.toObject();
        }

        if (!updatedOrNewEntity && !updatedMongoContact)
          return {
            success: false,
            message: "failed to update",
          };

        let updatedWholeContact = {};
        updatedMongoContact
          ? (updatedWholeContact = { ...updatedMongoContact })
          : (updatedWholeContact._id = mongoContacId);
        if (updatedOrNewEntity) {
          delete updatedOrNewEntity._id;
          delete updatedOrNewEntity._v;
          updatedWholeContact = {
            ...updatedWholeContact,
            ...updatedOrNewEntity,
          };
        }

        (async () => {
          const uploadResult = await searchClient.mergeOrUploadDocuments([
            updatedWholeContact.toIndex(),
          ]);
          for await (const result of uploadResult.results) {
            console.log(
              `Uploaded ${result.key}; succeeded? ${result.succeeded}`
            );
          }
        })();

        if (ignoreResponse) {
          return {
            success: true,
            message: "updated",
          };
        } else {
          return {
            success: true,
            message: "updated",
            contact: updatedWholeContact,
          };
        }
      } catch (err) {
        return {
          success: false,
          message: "failed to update",
          error: err,
        };
      }
    },
    removeContact: async (_, { contactId }) => {
      try {
        const res = await MongoDb.Contact.findOneAndRemove({
          _id: ObjectId(contactId),
        });
        if (!res)
          return {
            success: false,
            message: "failed to remove",
          };

        (async () => {
          const uploadResult = await searchClient.deleteDocuments([
            res.toIndex(),
          ]);
          for await (const result of uploadResult.results) {
            console.log(
              `Uploaded ${result.key}; succeeded? ${result.succeeded}`
            );
          }
        })();

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
    createBulkContacts: async (_, { contactList }) => {
      try {
        const allInsertedEntities = await MongoDb.Entity.insertMany(
          contactList
        );
        let allInsertedMongoContacts = [];
        let allMongoContactsToInsert = [];
        let entitiesIdsToDelete_error = [];

        for (let i = 0; i < allInsertedEntities.length; i++) {
          let insertedEntityId = allInsertedEntities[i]._id;
          let insertedEntity = getOnlyTheseFields(
            allInsertedEntities[i].toObject(),
            [
              "name",
              "address1",
              "address2",
              "city",
              "state",
              "zip",
              "country",
              "globalOwner",
            ]
          );

          let found;
          for (let i = 0; i < contactList.length && !found; i++) {
            let mongoContactToInsert = getOnlyTheseFields(contactList[i], [
              "mobilePhone",
              "homePhone",
              "primaryEmail",
              "activityLog",
              "createBy",
              "lastUpdateBy",
              "address1Alt",
              "address2Alt",
              "cityAlt",
              "stateAlt",
              "zipAlt",
              "countryAlt",
              "AltPhone",
              "secondaryEmail",
              "relatives",
              "linkedln",
              "facebook",
              "twitter",
              "leadSource",
              "companyName",
              "jobTitle",
            ]);
            let entityToInsert = getOnlyTheseFields(contactList[i], [
              "name",
              "address1",
              "address2",
              "city",
              "state",
              "zip",
              "country",
              "globalOwner",
            ]);

            if (deepEqualObjects(insertedEntity, entityToInsert)) {
              found = true;
              mongoContactToInsert.entity = insertedEntityId;
              allMongoContactsToInsert.push(mongoContactToInsert);
            }
          }

          if (!found) {
            entitiesIdsToDelete_error.push(ObjectId(insertedEntityId));
          }
        }

        if (allMongoContactsToInsert.length > 0) {
          allInsertedMongoContacts = await MongoDb.Contact.insertMany(
            allMongoContactsToInsert
          );
        }

        (async () => {
          //// deleting the no mathed entities
          if (entitiesIdsToDelete_error.length > 0) {
            //// doesn't work
            // MongoDb.Entity.deleteMany({
            //   _id: { $in: entitiesIdsToDelete_error },
            // });
          }

          //// joining entity and mongoContact
          const wholeContacts = [];
          for (let i = 0; i < allInsertedMongoContacts.length; i++) {
            const InsertedMongoContact = allInsertedMongoContacts[i].toObject();
            for (let j = 0; j < allInsertedEntities.length; j++) {
              const insertedEntityId = allInsertedEntities[j]._id;

              if (
                JSON.stringify(InsertedMongoContact.entity) ===
                JSON.stringify(insertedEntityId)
              ) {
                const insertedEntity = getOnlyTheseFields(
                  allInsertedEntities[j].toObject(),
                  [
                    "name",
                    "address1",
                    "address2",
                    "city",
                    "state",
                    "zip",
                    "country",
                    "globalOwner",
                  ]
                );

                wholeContacts.push({
                  ...InsertedMongoContact,
                  ...insertedEntity,
                });
                break;
              }
            }
          }

          const uploadResult = await searchClient.uploadDocumentsuploadDocuments(
            wholeContacts.map((res) => res.toIndex())
          );
          for await (const result of uploadResult.results) {
            console.log(
              `Uploaded ${result.key}; succeeded? ${result.succeeded}`
            );
          }
        })();

        if (entitiesIdsToDelete_error.length > 0)
          return {
            success: false,
            message: "fail adding some files",
          };
        if (
          !allInsertedEntities ||
          allInsertedEntities.length !== contactList.length ||
          allInsertedMongoContacts.length !== contactList.length
        )
          return {
            success: false,
            message: "fail to add",
          };

        return {
          success: true,
          message: "added bulk data",
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to bulk upload",
          error: err,
        };
      }
    },
  },
});
