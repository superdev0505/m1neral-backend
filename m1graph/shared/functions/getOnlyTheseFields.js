module.exports = (originalObject, fieldsArray, fieldsAs_Object) => {
  let newObject = {};

  if (fieldsArray && originalObject) {
    for (let i = 0; i < fieldsArray.length; i++) {
      const key = fieldsArray[i];

      if (Object.keys(originalObject).indexOf(key) !== -1) {
        if (fieldsAs_Object && Object.keys(fieldsAs_Object).indexOf(key) !== -1)
          newObject[fieldsAs_Object[key]] = originalObject[key];
        else newObject[key] = originalObject[key];
      }
    }
  }

  return newObject;
};
