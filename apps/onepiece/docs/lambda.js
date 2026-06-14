// replace cloudfront- headers with x-
exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  for (const [key, value] of Object.entries(headers)) {
    if (key.startsWith('cloudfront')) {
      const headerValue = value[0].value;
      const headerKey = value[0].key;
      const newHeaderKey = headerKey.replace('CloudFront-', 'X-');
      headers[newHeaderKey.toLowerCase()] = [{
        'key': newHeaderKey,
        'value': headerValue,
      }];
      delete headers[key];
    }
  }
  return request;
};
