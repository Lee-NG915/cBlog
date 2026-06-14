import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'components/Helmet';
import Header from 'containers/Checkout/components/Header';
import Footer from 'containers/Checkout/components/Footer';
import { LogIn, SignUp, ResetPass } from 'components/Welcome';
import { getUrl } from 'pages';
import { Container } from '@castlery/fortress';
import { loadIfNeeded as loadMarketing } from 'redux/modules/marketing';
import { useDispatch } from 'react-redux';
import style from './style.scss';

const Index = ({ location }, { router }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadMarketing('terms-of-use'));
  }, []);

  const onSuccess = () => {
    if (__YOTPO_ENABLED__ && (location.search === '?from=rewards' || location.search === '?from=the-castlery-club')) {
      router.push(getUrl('rewards'));
    } else if (location.state) {
      router.push(location.state.nextPathname + location.state.nextSearch);
    } else if (location.search.indexOf('redirectUrl=') > -1) {
      const match = location.search.match(/(?:[?&])redirectUrl=([^&]*)/);
      if (match) {
        const redirectUrl = decodeURIComponent(match[1]);
        window.location.href = redirectUrl;
      }
    } else {
      // router.push(getUrl('home'));
      window.location.href = __BASE_URL__;
    }
  };

  let content;
  if (location.pathname === getUrl('forgot-password')) {
    content = <ResetPass className={`${style.welcome}__resetPass`} onLogIn={() => router.push(getUrl('login'))} />;
  } else if (location.pathname === getUrl('signup')) {
    content = (
      <SignUp
        className={`${style.welcome}__signUp`}
        onLogIn={() => router.push(getUrl('login'))}
        onSuccess={onSuccess}
      />
    );
  } else {
    content = (
      <LogIn
        onSignUp={() => router.push(getUrl('signup'))}
        onResetPass={() => router.push(getUrl('forgot-password'))}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <div className={style.wrapper}>
      <Helmet path={location.pathname} />

      <Header />

      <div className={`${style.wrapper}__center`}>
        <Container fixed>
          <div className={style.welcome}>{content}</div>
        </Container>
      </div>

      <Footer />
    </div>
  );
};

Index.propTypes = {
  location: PropTypes.object,
};

Index.contextTypes = {
  router: PropTypes.object,
};

export default Index;
