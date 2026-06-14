import type { RequestHandler, Request } from 'express';
import Parser from 'ua-parser-js';

interface DeviceTypeRequest extends Request {
  device?: string;
}

function userAgentMiddleware(): RequestHandler {
  return (req: DeviceTypeRequest, res, next) => {
    const userAgent = Parser(req.headers['user-agent']);
    const deviceType = userAgent?.device?.type || 'desktop';
    // set device type to request for ssr
    req.device = deviceType; // will set to namespace
    res.cookie('device', deviceType, { expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), secure: true });
    next();
  };
}

export default userAgentMiddleware;
