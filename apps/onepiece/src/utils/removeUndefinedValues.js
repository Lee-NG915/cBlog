export const cleanData = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => cleanData(item)).filter((item) => item !== undefined);
  }
  if (typeof data === 'object' && data !== null) {
    const cleanedObject = {};
    for (const [key, value] of Object.entries(data)) {
      const cleanedValue = cleanData(value);
      if (cleanedValue !== undefined) {
        cleanedObject[key] = cleanedValue;
      }
    }
    return cleanedObject;
  }
  return data;
};
