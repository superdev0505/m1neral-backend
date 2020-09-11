const axios = require("axios")
const mongoose = require("mongoose")
const { NIL } = require("uuid")
const ObjectId = mongoose.Types.ObjectId

const melissaConnectorUrl = process.env["MELISSA_REST_URL"] || 'https://m1rest.azurewebsites.net'

module.exports = (MongoDb) => ({
  Query: {
    getPersonData: async (_, { persons }) => {
      const personatorUrl = `${melissaConnectorUrl}/personator`
      const personatorsearchUrl = `${melissaConnectorUrl}/personatorsearch`

      let allSuccess = true
      var responses = []
      for (const person of persons) {
        if (!person.address || !person.city || !person.state) {
          try {
            const response = await axios({
              method: "get",
              url: personatorsearchUrl,
              params: {
                full_name: person.fullName,
                postal: person.postal
              }
            })
        
            let data = await response.data
            console.log("personatorsearchUrl data", data)
            let records = data.Records
  
            for (const record of records) {
              let contact = {contact: ObjectId(person.id)}
              await MongoDb.MelissaAddressRecord.create({...record, ...contact})
  
              person.address = record.CurrentAddress.AddressLine1
              person.city = record.CurrentAddress.City
              person.state = record.CurrentAddress.State
            }
          } catch (error) {
            console.log('personatorsearch error', error)
            responses.push({ personId: person.id, message: 'error', error })
            allSuccess = false
          }
        }
        
        try {
          const response = await axios({
            method: "get",
            url: personatorUrl,
            params: {
              full_name: person.fullName,
              address: person.address,
              city: person.city,
              state: person.state,
              country: person.country,
              postal: person.postal
            }
          })
      
          let data = await response.data
          let records = data.Records
          let message = 'success'

          for (const record of records) {
            let contact = {contact: ObjectId(person.id)}
            const newMelissaRecord = await MongoDb.MelissaRecord.create({...record, ...contact})

            if (!newMelissaRecord) {
              message = 'error'
              allSuccess = false
            }
          }

          responses.push({ records, message })
        } catch (error) {
          console.log('personator error', error)
          responses.push({ personId: person.id, message: 'error', error })
          allSuccess = false
        }
      }

      return {responses, allSuccess}
    },
    getMelissaRecords: async (_, { contactId }) => {
      try {
        const melissaAddressRecords = await MongoDb.MelissaAddressRecord.find({
          contact: contactId,
        }).exec();

        const melissaRecords = await MongoDb.MelissaRecord.find({
          contact: contactId,
        }).exec();

        return {melissaAddressRecords, melissaRecords, success: true};
      } catch (err) {
        return {success: false, err};
      }
    },
    getLastMelissaRecord: async (_, { contactId }) => {
      /*
      in mongo console:
      db.melissaaddressrecords.createIndex({ ts: -1 })
      db.melissarecords.createIndex({ ts: -1 })
      */
      try {
        const melissaAddressRecord = await MongoDb.MelissaAddressRecord.findOne({
          contact: contactId,
        })
          .sort({ ts: -1 })
          .limit(1)
          .exec();

        const melissaRecord = await MongoDb.MelissaRecord.findOne({
          contact: contactId,
        })
          .sort({ ts: -1 })
          .limit(1)
          .exec();
        
        const updatedMelissaRecords = await MongoDb.MelissaRecordUpdate.find({
          $or: [
            { melissaRecord },
            { melissaAddressRecord }
          ]
        }).exec();

        return {melissaAddressRecord, melissaRecord, updatedMelissaRecords, success: true};
      } catch (err) {
        return {success: false, err};
      }
    },
    getMelissaRecordsCountForContactIds: async (_, { objectsIdsArray }) => {
      try {
        const ids = objectsIdsArray.map(function(el) { return mongoose.Types.ObjectId(el) })
        const samplesArray = await MongoDb.MelissaRecord.aggregate([
          {
            $match: { "contact": { $in: ids } },
          },
          {
            $group: {
              _id: "$contact",
              total: { $sum: 1 },
            },
          },
        ]).exec();

        return samplesArray;
      } catch (err) {
        return err;
      }
    },
  },
  Mutation: {
    updateMelissaAddressRecord: async (_, { melissaAddressRecord }) => {
      try {
        let id = melissaAddressRecord._id;
        const oldMelissaAddressRecord = await MongoDb.MelissaAddressRecord.findById(id).exec();
        let currentAddress = oldMelissaAddressRecord.CurrentAddress;

        const fieldName = Object.keys(melissaAddressRecord).find(key => key != '_id');
        const oldValue = currentAddress[fieldName];
        const newValue = melissaAddressRecord[fieldName];

        delete currentAddress._id;
        delete melissaAddressRecord._id;
        currentAddress = Object.assign(currentAddress, melissaAddressRecord);

        await MongoDb.MelissaRecordUpdate.create({
          melissaRecordType: 'address',
          melissaAddressRecord: ObjectId(id),
          fieldName,
          oldValue,
          newValue,
          contact: oldMelissaAddressRecord['contact']
        })
        
        let newMelissaAddressRecord = await MongoDb.MelissaAddressRecord.findOneAndUpdate(
          { _id: id }, { CurrentAddress: currentAddress }, {
            new: true,
            returnOriginal: false
          }
        ).exec();
        return {success: true, newMelissaAddressRecord};
      } catch (err) {
        return {success: false, err: err};
      }
    },
    updateMelissaRecord: async (_, { melissaRecord }) => {
      try {
        const oldMelissaRecord = await MongoDb.MelissaRecord.findById(melissaRecord._id).exec();
        const fieldName = Object.keys(melissaRecord).find(key => key != '_id')
        await MongoDb.MelissaRecordUpdate.create({
          melissaRecordType: 'main',
          melissaRecord: ObjectId(melissaRecord._id),
          fieldName: fieldName,
          oldValue: oldMelissaRecord[fieldName],
          newValue: melissaRecord[fieldName],
          contact: oldMelissaRecord['contact']
        })

        let newMelissaRecord = await MongoDb.MelissaRecord.findOneAndUpdate(
          { _id: melissaRecord._id }, melissaRecord, {
            new: true,
            returnOriginal: false
          }
        ).exec();

        return {success: true, newMelissaRecord};
      } catch (err) {
        return {success: false, err};
      }
    }
  },
})
