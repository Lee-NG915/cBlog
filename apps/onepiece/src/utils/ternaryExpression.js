export const ternaryExpressions = (judge, firstVal, secondValue) => {
  if (judge) {
    if (typeof firstVal === 'function') {
      return firstVal();
    }
    return firstVal;
  }
  if (typeof secondValue === 'function') {
    return secondValue();
  }
  return secondValue;
};
