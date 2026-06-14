// eslint-disable-next-line import/no-mutable-exports
import { datadogRum } from '@datadog/browser-rum';

const datadog = datadogRum;
export const setDatadogUser = (user) => {
  if (user.email) {
    datadogRum?.setUser({
      id: user.id,
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
    });
  }
};

export function initDatadogRum() {
  if (__CLIENT__ && __DATADOG_APPLICATION_ID__ && __DATADOG_CLIENT_TOKEN__ && !datadog) {
    datadogRum.init({
      applicationId: __DATADOG_APPLICATION_ID__,
      clientToken: __DATADOG_CLIENT_TOKEN__,
      site: 'datadoghq.com',
      service: 'onepiece',
      env: __APPLICATION_ENV__,
      version: __APP_VERSION__,
      sampleRate: 2,
      trackInteractions: true,
      allowedTracingOrigins: [/https:\/\/.*\.castlery\.(sg|com\.au|co)/],
    });
  }
}

export { datadog };
