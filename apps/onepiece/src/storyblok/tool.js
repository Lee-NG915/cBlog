export const hasRichText = (description) => {
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

export const extractPublicIdFromUrl = (url = '') => {
  const formatUrl = decodeURIComponent(url);
  if (formatUrl?.startsWith('https://res.cloudinary.com/castlery')) {
    const regex = /^https:\/\/res\.cloudinary\.com\/castlery\/(?:image|video)\/upload\/(v\d+\/)?(.+)\.\w+$/;
    const match = formatUrl.match(regex);
    if (match && match.length >= 3) {
      return match[2];
    }
    return formatUrl;
  }
  return formatUrl;
};
