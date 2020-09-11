function fieldMapper(val, keysMap) {
    if (val === null) return null;
    if (Array.isArray(val)) {
        return val.map(item => fieldMapper(item, keysMap));
    } else if (typeof val === "object") {
        return Object.keys(val).reduce((obj, key) => {
            const propVal = (() => {
                if (typeof val[key] === "object") {
                    if (keysMap[key]) {
                        if (Object.prototype.toString.call(val[key]) === '[object Date]') {
                            return val[key].toISOString()
                        }
                        return val[key].toString()
                    }
                    else {
                        return fieldMapper(val[key], keysMap)
                    }
                }
                return val[key]
            })();
            const propKey = fieldMapper(key, keysMap);
            obj[propKey] = propVal;
            return obj;
        }, {});
    } else if (typeof val === "string") {
        return keysMap[val] || val;
    }
    return val;
};
 
module.exports.fieldMapper = fieldMapper;