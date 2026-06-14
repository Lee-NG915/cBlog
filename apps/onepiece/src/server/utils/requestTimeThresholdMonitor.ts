import { captureNodeException } from 'utils/sentry.server.config';

export function requestTimeThresholdMonitor(req: Request, requestTime: number): void {
  const requestTimeThreshold = __REQUEST_TIME_THRESHOLD__ || 5000;
  const healthRequestTimeThreshold = __HEALTH_REQUEST_TIME_THRESHOLD__ || 1000;
  // only monitor the request time of the country url
  const country = __COUNTRY__.toLocaleLowerCase() || 'us';
  const isCountryUrl = req.url?.startsWith(`/${country}`);
  // console.log('req.url: ', req.url);
  // console.log('requestTime: ', requestTime);

  /**
   * 根据health check的请求时间来判断是否启用CSR
   */
  // const isHealthCheck = req.url?.startsWith('/health');
  // if (isHealthCheck) {
  //   if (requestTime > healthRequestTimeThreshold) {
  //     (global as any).ENABLE_CSR = true;
  //   } else {
  //     (global as any).ENABLE_CSR = false;
  //   }
  // }

  /**
   * track the request time of the country url
   */
  if (isCountryUrl) {
    if (requestTime > requestTimeThreshold) {
      // console.log('req.url: ', req.url);
      // console.log('requestTime: ', requestTime);
      console.warn(`Request time: ${requestTime}ms, url: ${req.url}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      captureNodeException(
        'warning',
        {
          message: `Request time: ${requestTime}ms, url: ${req.url}`,
          extra: {
            requestTime,
            url: req.url,
          },
        },
        '[Warning] Request time threshold monitor'
      );
    }
  }
}
