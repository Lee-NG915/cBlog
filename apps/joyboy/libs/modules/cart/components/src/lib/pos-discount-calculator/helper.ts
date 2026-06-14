export const formatPercent = (num: number) => {
  const n = Number.isInteger(num) ? num : num.toFixed(2);
  return n.toString();
};
