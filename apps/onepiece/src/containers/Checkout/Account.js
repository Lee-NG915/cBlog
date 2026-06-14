import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import Helmet from 'components/Helmet';
import { getUrl } from 'pages';
import Spinner from 'components/Spinner';
import { SignUp, LogIn, ResetPass } from 'components/Welcome';
import { confirmRegistration } from 'redux/modules/cart';
import classNames from 'classnames';
import { Container } from '@castlery/fortress';
import Footer from './components/Footer';
import Header from './components/Header';

import style from './style.scss';

const Account = ({ location }, { router, frame }) => {
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [form, setForm] = useState('signup'); // 'login', 'signup', 'resetpass'
  const page = user ? 'loading' : 'registration';

  const handleConfirm = (email) => {
    dispatch(confirmRegistration(email))
      .then(() => {
        router.replace(getUrl('checkout-shipping-address'));
      })
      .catch((error) => {
        frame.openModal('response', { body: error });
      });
  };

  useEffect(() => {
    // call registration if user is logged in and order is not empty
    if (user && cart?.data?.line_items?.length > 0) {
      handleConfirm();
    }
  }, []);

  const jump = (path) => {
    setForm(path);
  };

  let body;
  if (page === 'loading') {
    // call put registration if user exits
    body = (
      <div className={`${style.account}__placeholder`}>
        <Spinner />
      </div>
    );
  } else {
    // main account pages
    let accountPage;
    if (form === 'login') {
      accountPage = (
        <LogIn
          className={classNames(`${style.account}__form`)}
          onSignUp={() => jump('signup')}
          onResetPass={() => jump('resetpass')}
          onCartLoaded={handleConfirm}
        />
      );
    } else if (form === 'signup') {
      accountPage = (
        <SignUp
          className={classNames(`${style.account}__form`)}
          onLogIn={() => jump('login')}
          onCartLoaded={handleConfirm}
        />
      );
    } else {
      accountPage = <ResetPass className={classNames(`${style.account}__form`)} onLogIn={() => jump('login')} />;
    }

    body = (
      <Container
        fixed
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div className={`${style.account}__registration`}>{accountPage}</div>

        {cart?.processing && (
          <div className={style.mask}>
            <Spinner />
          </div>
        )}
      </Container>
    );
  }

  return (
    <div className={style.wrapper}>
      <Helmet path={location.pathname} />
      <Header />

      <div className={style.account}>{body}</div>

      <Footer />
    </div>
  );
};

Account.propTypes = {
  location: PropTypes.object.isRequired,
};

Account.contextTypes = {
  router: PropTypes.object,
  frame: PropTypes.object,
};

export default Account;
