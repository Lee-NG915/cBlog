export const hasRichText = (description: any | string) => {
  if (!description || typeof description !== 'object') {
    return false;
  }
  if (!Array.isArray(description.content) || description.content?.length === 0) {
    return false;
  }
  if (!Array.isArray(description.content[0].content) || description.content[0].content?.length === 0) {
    return false;
  }
  return true;
};
