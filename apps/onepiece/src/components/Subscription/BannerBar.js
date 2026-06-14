import React from 'react';
import PropTypes from 'prop-types';
import { isOutdated } from 'utils/time';
import style from './style.scss';
import Input from './Input';

const BannerBar = (props, context) => {
  const isGiveawayValid = !isOutdated('2021-03-15 00:00', '2021-03-22 00:00');

  const titles = {
    SG: 'Exclusive offers, new arrivals, inspiration & more!',
    AU: isGiveawayValid ? 'Stand to win a $270 gift voucher*' : `Exclusive deals, new arrivals, inspiration & more.`,
    US: isGiveawayValid ? 'Fancy a $270 gift voucher?*' : `Exclusive deals, new arrivals, inspiration & more.`,
  };

  const subTitles = {
    SG: 'Join our mailing list!',
    AU: isGiveawayValid ? 'Join our mailing list for a chance to win, this week only!' : null,
    US: isGiveawayValid ? 'Join our mailing list for a chance to win, this week only!' : null,
  };

  const footers = {
    SG: 'We’ll never spam you. *T&Cs apply.',
    AU: isGiveawayValid
      ? '*New subscribers only. Duplicate entries are not allowed. <br/> Winners will be contacted via email. T&Cs apply.'
      : 'We’ll never spam you. *T&Cs apply.',
    US: isGiveawayValid
      ? '*New subscribers only. Duplicate entries are not allowed. <br /> Winners will be contacted via email.'
      : null,
  };

  const title = titles[__COUNTRY__];
  const subTitle = subTitles[__COUNTRY__];
  const footer = footers[__COUNTRY__];

  return (
    <div className={`${style.banner} ${isGiveawayValid ? `${style.banner}--giveaway` : ''}`}>
      <div className={`${style.banner}__header ${isGiveawayValid ? `${style.banner}__header--giveaway` : ''}`}>
        <h2
          className={`${style.banner}__header-title ${
            isGiveawayValid ? `${style.banner}__header-title--giveaway` : ''
          }`}
        >
          {title}
        </h2>
        {subTitle && (
          <div
            className={`${style.banner}__header-subTitle ${
              isGiveawayValid ? `${style.banner}__header-subTitle--giveaway` : ''
            }`}
          >
            {subTitle}
          </div>
        )}
      </div>
      <div className={`${style.banner}__body`}>
        <Input
          type="HOMEPAGE_BANNER"
          className={`${style.banner}__input`}
          onSuccess={() =>
            context.frame.openModal('response', {
              status: 'successful',
              title: 'Thank You!',
              body: 'You have successfully subscribed to the newsletter.',
            })
          }
        />
      </div>
      {footer && (
        <div
          className={`${style.banner}__footer ${isGiveawayValid ? `${style.banner}__footer--giveaway` : ''}`}
          dangerouslySetInnerHTML={{ __html: footer }}
        />
      )}
    </div>
  );
};

BannerBar.contextTypes = {
  frame: PropTypes.object,
};

export default BannerBar;
