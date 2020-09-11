const storageBlob = require ("@azure/storage-blob");
const azureStorage = require("azure-storage");

const storage = (() => {

    var config = {
        tokenExpirationInMinutes : 60,
    }

    var getConnectionString = function (tenantName) {
        
        // ** FUTURE ** decide for storage account according to tenant

        var connectionString = process.env["tenantStorageAccount"];
    
        if (!connectionString)
            throw "missing tenant connection string";
        
        return connectionString;
    }

    var getDefaultContainerName = function(tenantName) {
        /* change when support multi tenant or custom containers */
        var containerName =  tenantName; /* CHANGE IN FUTUE WHEN MULTI TENANT SUPPORT */

        /* check if exists */
        var storageBlobClient = storageBlob.BlobServiceClient.fromConnectionString(getConnectionString(tenantName));
        var container = storageBlobClient.getContainerClient(containerName);
        container.createIfNotExists();

        /* return a valid name for use */
        return containerName;

    };

    var createBaseToken = function (tenantName, container, blobName, permissions) {
        var blobMgtService = azureStorage.createBlobService(getConnectionString(tenantName));

        var startDate = new Date();
        startDate.setMinutes(startDate.getMinutes() - 5);
        var expiryDate = new Date(startDate);
        expiryDate.setMinutes(startDate.getMinutes() + config.tokenExpirationInMinutes);

        permissions = permissions || azureStorage.BlobUtilities.SharedAccessPermissions.READ;

        var sharedAccessPolicy = {
            AccessPolicy: {
                Permissions: permissions,
                Start: startDate,
                Expiry: expiryDate
            }
        };

        var sasToken = blobMgtService.generateSharedAccessSignature(container, blobName, sharedAccessPolicy);

        return {
            token: sasToken,
            uri: blobMgtService.getUrl(container, blobName, sasToken, true)
        };
    }

    var getUploadToken = function (tenantName, container,blobName) {
        return createBaseToken(tenantName,container,blobName,azureStorage.BlobUtilities.SharedAccessPermissions.WRITE);
    }

    var getViewToken = function (tenantName,container,blobName) {
        return createBaseToken(tenantName,container,blobName,azureStorage.BlobUtilities.SharedAccessPermissions.READ);
    }

    return {
        getDefaultContainerName : getDefaultContainerName,
        getUploadToken : getUploadToken,
        getViewToken : getViewToken
    }

})();


module.exports = storage;