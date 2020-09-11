module.exports = (MongoDb) => ({
  Query: {
    messagesByUser: async (_, { userId }) => {
      try {
        const allMessages = await MongoDb.Message.find(
          {
            user: userId,
            archive: false,
          },
          //"contact, msgId, contactEmail, title, message, shortMsg, sendRecv, archive, receivedAt"
        )
          //.populate("receivedAt")
          .exec();
        return allMessages;
      } catch (err) {
        return err;
      }
    },
    messagesByContact: async (_, { contactId }) => {
      try {
        const allMessages = await MongoDb.Message.find(
          {
            contact: contactId,
            archive: false,
          },
          //"contact, msgId, contactEmail, title, message, shortMsg, sendRecv, archive, receivedAt"
        )
          //.populate("receivedAt")
          .exec();
        return allMessages;
      } catch (err) {
        return err;
      }
    },
    messagesByUserAndContact: async (_, { userId, contactId }) => {
      try {
        const allMessages = await MongoDb.Message.find(
          {
            user: userId,
            contact: contactId,
            archive: false,
          },
          //"contact, msgId, contactEmail, title, message, shortMsg, sendRecv, archive, receivedAt"
        )
          //.populate("receivedAt")
          //.sort({receivedAt: 1})
          //.limit(5)
          .exec();
        return allMessages;
      } catch (err) {
        return err;
      }
    },
    messagesByUserAndContactWithShort: async (_, { userId, contactId }) => {
      try {
        const allMessages = await MongoDb.Message.find(
          {
            user: userId,
            contact: contactId,
            archive: false,
          },
          //"contact, msgId, contactEmail, title, shortMsg, sendRecv, archive, receivedAt"
        )
          //.populate("receivedAt")
          .exec();
        return allMessages;
      } catch (err) {
        return err;
      }
    },
    messagesByUserAndContactIncludeArchive: async ( _, { userId, contactId }
    ) => {
      try {
        const allMessages = await MongoDb.Message.find(
          {
            user: userId,
            contact: contactId,
          },
          //"contact, msgId, contactEmail, title, message, shortMsg, sendRecv, archive, receivedAt"
        )
          //.populate("receivedAt")
          .exec();
        return allMessages;
      } catch (err) {
        return err;
      }
    },
  },
  Mutation: {
    addMessage: async (_, { message }) => {
      try {
        const newMessage = await MongoDb.Message.create(message);

        if (!newMessage)
          return {
            success: false,
            message: "failed to create",
          };
        return {
          success: true,
          message: "updated",
          newMessage: newMessage,
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to create",
          error: err,
        };
      }
    },
    updateMessage: async (_, { message }) => {
      try {
        const newMessage = await MongoDb.Message.findOneAndUpdate(
          {
            _id: message._id,
          },
          message,
          {
            new: true,
          }
        );

        if (!newMessage)
          return {
            success: false,
            message: "failed to update",
          };
        return {
          success: true,
          message: "updated",
          newMessage: newMessage,
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to update",
          error: err,
        };
      }
    },
    addBulkMessages: async (_, { messages }) => {
      try {
        const res = await MongoDb.Message.insertMany(messages);

        if (!res)
          return {
            success: false,
            message: "failed to add messages",
          };
        return {
          success: true,
          message: "added bulk messages",
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to add bulk messages",
          error: err,
        };
      }
    },
  }
});
