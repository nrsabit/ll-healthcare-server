const pick = <T extends Record<string, unknown>, K extends keyof T>(
  queryObj: T,
  fieldNames: K[]
) => {
  const finalObj: Partial<T> = {};

  if (fieldNames.length > 0) {
    for (const key of fieldNames) {
      if (queryObj && Object.hasOwnProperty.call(queryObj, key)) {
        finalObj[key] = queryObj[key];
      }
    }
  }

  return finalObj;
};

export default pick;
