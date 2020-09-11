const tenant = (() => {

    var getCurrentTenant = function (userId) {
        /* FUTURE - when ready fetch it from user context or external resource */

        return process.env["tenant"];
    }

    return {
        current : getCurrentTenant
    }
})();

module.exports = tenant;