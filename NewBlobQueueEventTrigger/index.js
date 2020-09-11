const MONGODB_CONNECTION_STRING = process.env["MONGODB_CONNECTION_STRING"];
const Enums = require("../m1graph/common/enums");
const storageBlob = require ("@azure/storage-blob");

function extractStorageDetails (blobUrl) {
    var shortUrl = blobUrl.replace("https://","");
    var strItems = shortUrl.split("/");

    return {
        storageHost : strItems[0],
        containerName : strItems[1],
        fileName : strItems[2]
    };
}

function getConntectionString(storageHost) {
    // change when supporting multi tenant
    
    switch (storageHost) {
        case "m1neralstorage.blob.core.windows.net":
            return process.env["tenantStorageAccount"];
        default:
            return process.env["tenantStorageAccount"];
    }
}



module.exports = async function(context, mySbMsg) {
    context.log(typeof mySbMsg);
    context.log(mySbMsg);

    if (mySbMsg.eventType != "Microsoft.Storage.BlobCreated")
        return;

    try {

        // extract storage details to bind it to connection string
        var storageDetails = extractStorageDetails(mySbMsg.data.url)

        // load the blob data from storage account
        var storageConnectionString = getConntectionString(storageDetails.storageHost);
        var storageBlobClient = storageBlob.BlobServiceClient.fromConnectionString(storageConnectionString);
        var storagecontainerClient = storageBlobClient.getContainerClient(storageDetails.containerName);
        var blobClient = storagecontainerClient.getBlockBlobClient(storageDetails.fileName);

        var properties = await blobClient.getProperties();

        // find the mongo item using internal key
        var blobData = {
            blobUrl: mySbMsg.data.url,
            internalKey: properties.metadata.internalkey,
            contentType: properties.contentType,
            size: properties.contentLength,
        };

        // connect to mongo
        let MongoConnection = require("../m1graph/mongo/mongoConnection").connect(MONGODB_CONNECTION_STRING); //Creating Mongodb Azure Connection
        let MongoDb = require("../m1graph/mongo/models")(MongoConnection);

        // update mongo
        var file = await MongoDb.File.findOneAndUpdate({
            internalKey: blobData.internalKey
        }, {
            state: Enums.fileStateEnum.ACTIVE,
            contentType: blobData.contentType,
            fileUrl: blobData.blobUrl,
            ts: Date.now()
        });

        MongoConnection.close();

    }
    catch (e) {
        context.log(e);
    }
};