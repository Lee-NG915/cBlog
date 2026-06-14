import React from 'react';
import Header from 'components/Header';
import Footer from 'components/Footer';
import Helmet from 'components/Helmet';

export default function (ComposedComponent) {
  return (props) => {
    const { pathname } = props.location;

    return (
      <div>
        <Helmet path={pathname} />
        <Header />
        <ComposedComponent />
        <Footer />
      </div>
    );
  };
}
