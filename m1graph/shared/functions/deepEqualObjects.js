function isObject(object) {
  return object != null && typeof object === "object";
}

module.exports = (object1, object2) => {
  if (Object.is(object1, object2)) {
    return true;
  }

  if (!object1 || !object2) {
    return false;
  }

  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (object1[key] !== object2[key]) {
      const val1 = object1[key];
      const val2 = object2[key];

      const areObjects = isObject(val1) && isObject(val2);
      const areArrays = Array.isArray(val1) && Array.isArray(val2);
      if (
        ((areObjects || areArrays) && !deepEqual(val1, val2)) ||
        (!areObjects && !areArrays && val1 !== val2)
      ) {
        return false;
      }
    }
  }

  return true;
};
