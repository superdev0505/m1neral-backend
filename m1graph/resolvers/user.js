module.exports = (MongoDb) => ({
  Query: {
    userByEmail: async (_, { userEmail }) => {
      try {
        const user = await MongoDb.User.findOne({ email: userEmail }).exec();
        return user;
      } catch (err) {
        return err;
      }
    },
  },
  Mutation: {
    findOrCreateUser: async (_, { user }) => {
      try {
        const userFound = await MongoDb.User.findOne({
          email: user.email,
        }).exec();

        if (!userFound) {
          const newUser = await MongoDb.User.create(user);

          if (!newUser)
            return {
              success: false,
              message: "failed to create",
            };

          return {
            success: true,
            message: "created",
            user: newUser,
          };
        } else {
          return {
            success: true,
            message: "found",
            user: userFound,
          };
        }
      } catch (err) {
        return {
          success: false,
          message: "failed to find and create",
          error: err,
        };
      }
    },
  },
});
