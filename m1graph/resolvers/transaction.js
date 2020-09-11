const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const data_file = {
  lanes: [
    {
      id: "lane1",
      title: "Offer Preparation",
      cards: [
        {
          id: "Card1",
          title: "THORNTON, CHARLES T",
          description:
            "API: 4230130541\nWell Name: CHRISTOPHER -38- 4\nNRI: 0.017857\nTax Value: $10,860",
          label: "$103,100",
        },
      ],
    },
    {
      id: "lane2",
      title: "Offer Extended",
      cards: [
        {
          id: "Card3",
          title: "SMITH, JAMES E",
          description:
            "Location: WARD, TX\nRoyalty: 20%\nAcreage: 4.83 NMA (7.728 NRA)\nPrice Per NMA: $15,000",
          label: "$115,900",
        },
        {
          id: "Card2",
          title: "CHRISTOPHER, EDITH",
          description:
            "API: 4230130541\nWell Name: CHRISTOPHER -38- 4\nNRI: 0.005952\nTax Value: $3,620",
          label: "$54,739",
        },
      ],
    },
    {
      id: "lane3",
      title: "Accepted - Due Diligence",
      cards: [
        {
          id: "Card4",
          title: "JONES, MICHAEL F",
          description:
            "Location: UPTON, TX\nRoyalty: 12.5%\nAcreage: 10.2 NMA (10.2 NRA)\nPrice Per NMA: $32,000",
          label: "$326,400",
        },
      ],
    },
    {
      id: "lane4",
      title: "Deal Closed",
      cards: [
        {
          id: "Card5",
          title: "MOUSSEAU, VICKI L",
          description:
            "Location: LEA, NM\nRoyalty: 18.75%\nAcreage: 6.7 NMA (10.05 NRA)\nPrice Per NMA: $18,000",
          label: "$180,900",
        },
        {
          id: "Card6",
          title: "CANON, MICHAEL J",
          description:
            "Location: REEVES, TX\nRoyalty: 15.625%\nAcreage: 43 NMA (53.75 NRA)\nPrice Per NMA: $32,000",
          label: "$571,094",
        },
      ],
    },
    {
      id: "lane5",
      title: "Offer Rejected",

      cards: [
        {
          id: "Card7",
          title: "SCARBOROUGH, KATHRYN",
          description:
            "Location: LOVING, TX\nRoyalty: 12.5%\nAcreage: 3 NMA (3 NRA)\nPrice Per NMA: $19,000",
          label: "$57,000",
        },
        {
          id: "Card8",
          title: "TRAYLOR, MARY ELIZABETH",
          description:
            "API: 4230133032\nWell Name: PISTOL 24-24 2H\nNRI: 0.046743\nTax Value: $215,690",
          label: "$943,291",
        },
        {
          id: "Card9",
          title: "KING, JACOB B",
          description:
            "Location: REEVES, TX\nRoyalty: 20%\nAcreage: 150 NMA (240 NRA)\nPrice Per NMA: $9,500",
          label: "$2,280,000",
        },
      ],
    },
  ],
};

module.exports = (MongoDb) => ({
  Query: {
    transactionData: async (_, { userId }) => {
      try {
        const transaction = await MongoDb.Transaction.findOne({
          user: userId,
        }).exec();

        if (!transaction) {
          const newTransaction = await MongoDb.Transaction.create({
            allData: data_file,
            user: userId,
          });
          return newTransaction;
        } else {
          return transaction;
        }
      } catch (err) {
        return err;
      }
    },
  },
  Mutation: {
    addTransaction: async (_, { transaction }) => {
      try {
        const newTransaction = await MongoDb.Transaction.create(transaction);

        if (!newTransaction)
          return {
            success: false,
            message: "failed to create",
          };
        return {
          success: true,
          message: "created",
          transaction: newTransaction,
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to create",
          error: err,
        };
      }
    },

    updateTransaction: async (_, { transactionId, transaction }) => {
      try {
        const res = await MongoDb.Transaction.findOneAndUpdate(
          {
            _id: transactionId,
          },
          transaction
        );
        if (!res)
          return {
            success: false,
            message: "failed to update",
          };
        return {
          success: true,
          message: "updated",
          transaction: res, ///iqual to transaction var
        };
      } catch (err) {
        return {
          success: false,
          message: "failed to update",
          error: err,
        };
      }
    },

    // removeTransaction: async (_, { transactionId }) => {
    //   try {
    //     const res = await MongoDb.Transaction.findOneAndRemove({
    //       _id: transactionId,
    //     });
    //     if (!res)
    //       return {
    //         success: false,
    //         message: "failed to remove",
    //       };
    //     return {
    //       success: true,
    //       message: "removed",
    //     };
    //   } catch (err) {
    //     return {
    //       success: false,
    //       message: "failed to remove",
    //       error: err,
    //     };
    //   }
    // },
  },
});
