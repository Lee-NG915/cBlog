import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';

import lang from 'utils/lang';
import { getDate } from 'utils/time';
import { withUseBreakpoints } from 'utils/page';
import { Container } from '@castlery/fortress';
import style from './style.scss';

@withUseBreakpoints
export default class Footer extends Component {
  static propTypes = {
    breakpoints: PropTypes.object,
  };

  render() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    return (
      <div className={style.footer}>
        <Container fixed sx={{ padding: '0' }}>
          {!desktop && (
            <div className={`${style.footer}__info`}>
              <p className={`${style.footer}__title`}>Need any help on checkout?</p>
              <p>
                {__COUNTRY__ === 'SG' ? 'WhatsApp' : 'Call us:'} &nbsp;
                {__COUNTRY__ === 'SG' ? (
                  <a href={`https://wa.me/${lang.t('common.whatsapp.value')}`}>
                    {lang.t('common.whatsapp.presentation')}
                  </a>
                ) : (
                  <a href={`tel:${lang.t('common.telephone.value')}`}>{lang.t('common.telephone.presentation')}</a>
                )}
                <br />
                {__COUNTRY__ === 'SG' && 'Mon - Sun: 10:00am - 9:00pm'}
                {__COUNTRY__ === 'AU' && 'Mon - Fri: 9:30am - 8:00pm, Sat - Sun: 10:00am - 8:00pm'}
                {__COUNTRY__ === 'US' && 'Mon - Fri: 10:00am - 6:00pm'}
              </p>
            </div>
          )}
          <div className={`${style.footer}__main`}>
            <div className={`${style.footer}__main__icons`}>
              <div className={`${style.footer}__main__secure`}>
                <ReactSVG className={`${style.footer}__main__lock`} name="lock-simple" />
                <div>
                  <div className={`${style.footer}__main__secure-title`}>Secure Checkout</div>
                  {desktop && (
                    <div className={`${style.footer}__main__secure-desc`}>All transactions are encrypted.</div>
                  )}
                </div>
              </div>
            </div>
            <p>&copy; {getDate().year()} Castlery</p>
          </div>
        </Container>
      </div>
    );
  }
}
