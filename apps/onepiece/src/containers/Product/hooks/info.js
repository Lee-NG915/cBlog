const combineProperties = (pArr1, pArr2) => {
  if (!pArr1 || !pArr2) {
    return [];
  }
  const finalArr = pArr1.slice();

  pArr2.forEach((p) => {
    const index = finalArr.findIndex((_p) => _p.name === p.name);
    if (index > -1) {
      finalArr.splice(index, 1, p);
    } else {
      finalArr.push(p);
    }
  });

  return finalArr;
};

export { combineProperties };
