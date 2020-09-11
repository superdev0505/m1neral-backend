module.exports = (MongoDb) => ({
  Query: {
    profileByEmail: async (_, { userEmail }) => {
      try {
        const profile = await MongoDb.Profile.findOne({
          email: userEmail,
        });
        if (!profile) {
          return {
            success: false,
            message: "Failed",
          };
        }

        return {
          success: true,
          profile,
        };
      } catch (err) {
        return {
          success: false,
          message: "Failed",
        };
      }
    },
  },
  Mutation: {
    upsertProfile: async (_, { profile }) => {
      const {
        email,
        fullname,
        phone,
        profileImage,
        displayname,
        timezone,
        activity,
        outlook_integrated,
      } = profile;
      try {
        const newProfile = await MongoDb.Profile.update(
          {
            email,
          },
          {
            $set: {
              email,
              fullname,
              phone,
              profileImage,
              displayname,
              timezone,
              activity,
              outlook_integrated,
            },
          },
          { upsert: true }
        );
        if (!newProfile) {
          return {
            success: false,
            message: "Failed",
          };
        }
        return {
          success: true,
          message: "Created",
        };
      } catch (error) {
        return {
          success: false,
          message: "Failed ",
        };
      }
    },
  },
});
