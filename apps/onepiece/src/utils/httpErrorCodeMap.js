// 409 => CONFLICT 并发
export const httpErrorCodeMap = new Map([
  ['CONFLICT', { code: 409 }],
  ['TOO_MANY_REQUESTS', { code: 429 }],
]);
