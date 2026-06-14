import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'components/Helmet';
import { wrapPage } from 'utils/page';
import { getOtherContext } from 'utils/dy';
import { useLocation } from 'containers/Product/hooks/product';
import { Container } from '@castlery/fortress';
import SimpleProductRecommendation from 'containers/Product/components/SimpleProductRecommendation';
import style from './style.scss';

const NotFound = ({ location }) => {
  const _location = useLocation();
  if (_location?.pathname === '/test-error-page') {
    throw new Error('Test Error Page');
  }
  // fix dy widget under products page
  getOtherContext();
  return (
    <div className={style.wrapper}>
      <Helmet page={{ title: 'Page Not Found' }} path="">
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className={`${style.wrapper}__container`}>
        <h2 className={`${style.wrapper}__container-head`}>Hmm...this page can’t be found!</h2>
        <p className={`${style.wrapper}__container-intro`}>It may have been moved, retired or updated.</p>
      </div>
      <Container fixed>
        <SimpleProductRecommendation selector="LP 404 (API)" />
      </Container>
    </div>
  );
};

NotFound.propTypes = {
  location: PropTypes.object,
};

export default wrapPage()(NotFound);

export const NotFoundWithoutWrapPage = NotFound;
