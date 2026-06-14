import Header from 'components/Careers/Header';
import { Container, Typography } from '@castlery/fortress';
import * as Sentry from '@sentry/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import ApiClient from 'helpers/ApiClient';
import { getRealTimePayload } from 'utils/dy';
import style from './style.scss';
import ErrorRecommendation from './ErrorRecommendation';

export default function ErrorPage({ error, componentStack, eventId }) {
  // const DYWidget = 'LP 404';
  if (error && !eventId) {
    // 使用同步分支避免重复上报：如果错误边界已生成 eventId，说明已经被上报
    Sentry.withScope((scope) => {
      if (componentStack) scope.setExtra('componentStack', componentStack);
      scope.setTag('from_error_page', 'true');
      scope.setExtra('location_href', typeof window !== 'undefined' ? window.location?.href : '');
      Sentry.captureException(error);
    });
  }
  const [dyData, setDyData] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const client = new ApiClient();
    const url = 'https://direct.dy-api.com/v2/serve/user/choose';
    const payload = getRealTimePayload({
      pageType: 'OTHER',
      selectorNames: ['LP 404 (API)'],
    });
    client
      .post(url, payload)
      .then((res) => {
        if (!cancelled) {
          if (res?.choices?.[0]?.variations?.[0]?.payload) {
            setDyData(res?.choices?.[0]?.variations?.[0]?.payload);
          }
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  function refreshPage() {
    window.location.reload();
  }
  return (
    <>
      <Header />
      <Container maxWidth="90vw">
        <div className={style.content}>
          <Typography level="h2" sx={{ marginBottom: '20px' }} alignContent="center" textAlign="center">
            An unexpected error has occurred.
          </Typography>
          <Typography level="body1" alignContent="center" textAlign="center">
            Please
            <span onClick={refreshPage} className={style.refreshText}>
              refresh
            </span>
            the page and try again.
          </Typography>
        </div>
      </Container>
      <Container fixed sx={{ marginTop: '100px' }}>
        {dyData && <ErrorRecommendation recommendationInfo={dyData} />}
        {/* <SimpleProductRecommendation selector="LP 404 (API)" /> */}
      </Container>
    </>
  );
}

ErrorPage.propTypes = {
  error: PropTypes.any,
  componentStack: PropTypes.string,
  eventId: PropTypes.string,
};
