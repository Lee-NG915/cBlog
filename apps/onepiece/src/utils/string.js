export function capitalize(text) {
  if (!text) return '';
  let res = text;
  try {
    res = text.toLocaleLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
  } catch (error) {
    console.log(`==============>error`);
    console.log(error);
  }
  return res;
}
