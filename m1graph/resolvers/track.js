module.exports = (MongoDb) => ({
  Query: {
    tracksByObjectType: async (_, { objectType }) => {
      try {
        const allTracks = await MongoDb.Track.find({
          objectType: objectType,
        }).exec();
        return allTracks;
      } catch (err) {
        return err;
      }
    },
    trackByObjectId: async (_, { objectId }) => {
      try {
        const track = await MongoDb.Track.findOne({
          trackOn: objectId,
        }).exec();
        return track;
      } catch (err) {
        return err;
      }
    },
  },
  Mutation: {
    toggleCreateRemoveTrack: async (_, { track }) => {
      try {
        const { user, ...trackWithoutUser } = track;

        const found = await MongoDb.Track.findOneAndRemove(trackWithoutUser);

        if (!found) {
          const newTrack = await MongoDb.Track.create({
            ...trackWithoutUser,
            user,
          });

          if (!newTrack)
            return {
              success: false,
            };
          return {
            success: true,
            tracking: true,
          };
        } else {
          return {
            success: true,
            tracking: false,
          };
        }
      } catch (err) {
        return {
          success: false,
          tracking: false,
          error: err,
        };
      }
    },
    toggleCreateRemoveTracks: async (_, { tracks }) => {
      let result = 0;
      for (let j = 0; j < tracks.length; j++) {
        try {
          const { user, ...trackWithoutUser } = tracks[j];

          const found = await MongoDb.Track.findOneAndRemove(trackWithoutUser);

          if (!found) {
            const newTrack = await MongoDb.Track.create({
              ...trackWithoutUser,
              user,
            });
            if (newTrack) result++;
          } else {
            result++;
          }
        } catch (err) {
          return {
            success: false,
            tracking: false,
            error: err,
          };
        }
      }
      return {
        success: true,
        tracking: result,
      };
    },
    upsertTrack: async (_, { track }) => {
      try {
        const newTrack = await MongoDb.Track.create(track);

        if (!newTrack)
          return {
            success: false,
            message: "failed to create",
          };
        return {
          success: true,
          message: "updated",
          track: newTrack,
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to create",
          error: err,
        };
      }
    },
    removeTrack: async (_, { trackId }) => {
      try {
        const res = await MongoDb.Track.findOneAndRemove({ _id: trackId });
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
  },
});
