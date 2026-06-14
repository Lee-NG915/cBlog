import React, { Component } from 'react';
import Helmet from 'components/Helmet';
import { getUrl } from 'pages';
import { GhostArrowBtn } from 'components/Button';
import { Container, Typography } from '@castlery/fortress';
import Footer from './components/Footer';
import Header from './components/Header';

import style from './style.scss';

export default class Empty extends Component {
  render() {
    const { pathname } = this.props.location;

    return (
      <div className={style.wrapper}>
        <Helmet path={pathname} />
        <Header />

        <div className={style.empty}>
          <Container fixed>
            <Typography level="h1">There is nothing is your cart. Start shopping to fill it up!</Typography>

            <GhostArrowBtn href={__BASE_URL__} text="Go Shopping" className={`${style.empty}__btn`} hasArrow={false} />
          </Container>
        </div>

        <Footer />
      </div>
    );
  }
}
