module.exports = (MongoDb) => {
  let UserResolver = require("./user")(MongoDb);
  let ProfileResolver = require("./profile")(MongoDb);
  let MessageResolver = require("./message")(MongoDb);
  let CommentResolver = require("./comment")(MongoDb);
  let TagResolver = require("./tag")(MongoDb);
  let TrackResolver = require("./track")(MongoDb);
  let TransactionResolver = require("./transaction")(MongoDb);
  let ContactResolver = require("./contact")(MongoDb);
  let CustomLayerResolver = require("./custom_layer")(MongoDb);
  let FileLayerResolver = require("./file_layer")(MongoDb);
  let SearchHistoryResolver = require("./searchHistory")(MongoDb);
  let MelissaResolver = require("./melissa")(MongoDb);
  let FileResolver = require("./file")(MongoDb);
  let ParcelOwnershipResolver = require("./parcelOwnership")(MongoDb);
  let EntityResolver = require("./entity")(MongoDb);
  let LayerConfigResolver = require("./ud_layer_config")(MongoDb);
  let LayerStateResolver = require("./layersState")(MongoDb);
  let MSGraphResolver = require("./msgraph")();

  return {
    QueryResolvers: {
      ...UserResolver.Query,
      ...CommentResolver.Query,
      ...TagResolver.Query,
      ...TrackResolver.Query,
      ...TransactionResolver.Query,
      ...ContactResolver.Query,
      ...CustomLayerResolver.Query,
      ...ProfileResolver.Query,
      ...FileLayerResolver.Query,
      ...MessageResolver.Query,
      ...SearchHistoryResolver.Query,
      ...MelissaResolver.Query,
      ...FileResolver.Query,
      ...ParcelOwnershipResolver.Query,
      ...EntityResolver.Query,
      ...LayerConfigResolver.Query,
      ...LayerStateResolver.Query,
      ...MSGraphResolver.Query,
    },
    MutationResolvers: {
      ...UserResolver.Mutation,
      ...CommentResolver.Mutation,
      ...TagResolver.Mutation,
      ...TrackResolver.Mutation,
      ...TransactionResolver.Mutation,
      ...ContactResolver.Mutation,
      ...CustomLayerResolver.Mutation,
      ...ProfileResolver.Mutation,
      ...FileLayerResolver.Mutation,
      ...MessageResolver.Mutation,
      ...SearchHistoryResolver.Mutation,
      ...FileResolver.Mutation,
      ...ParcelOwnershipResolver.Mutation,
      ...EntityResolver.Mutation,
      ...LayerConfigResolver.Mutation,
      ...LayerStateResolver.Mutation,
      ...MelissaResolver.Mutation,
      ...MSGraphResolver.Mutation,
    },
  };
};
