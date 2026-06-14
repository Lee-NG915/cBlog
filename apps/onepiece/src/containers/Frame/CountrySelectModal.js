import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { set as setCookie } from 'helpers/Cookie';
import { withNamedSelectContext } from 'utils/contextUtils';
import SvgIcon from 'components/SvgIcon';
import { CloseBtn } from 'components/Button';
import { FrameContext } from './FrameContext';
import style from './style.scss';

@withNamedSelectContext(FrameContext, 'frame')
export default class CountrySelectModal extends Component {
  static animation = 'plain';

  static propTypes = {
    countryCodeByIP: PropTypes.string,
    frame: PropTypes.object,
  };

  handleSelectCountry = (e, selectedCountry = __COUNTRY__) => {
    const { frame } = this.props;
    if (selectedCountry === __COUNTRY__) {
      setCookie('select_country_hint_hidden', JSON.stringify(true), 30, '/');
    }
    setCookie('castlery_shop', selectedCountry.toLowerCase(), 365, '/');
    frame.removeModal();
  };

  render() {
    const { countryCodeByIP } = this.props;
    const CONTENT = {
      SG: {
        name: 'Singapore',
        title: `It looks like you’re<br/> browsing from Singapore`,
        flag: 'sg-flag',
        action: '/sg',
        actionText: 'Shop in Singapore',
      },
      AU: {
        name: 'Australia',
        title: `It looks like you’re<br /> browsing from Australia`,
        flag: 'au-flag',
        action: '/au',
        actionText: 'Shop in Australia',
      },
      US: {
        name: 'U.S.',
        title: `It looks like you’re<br /> browsing from the U.S.`,
        flag: 'us-flag',
        action: '/us',
        actionText: 'Shop in the U.S.',
      },
      CA: {
        name: 'Canada',
        title: `It looks like you’re<br /> browsing from the Canada`,
        flag: 'ca-flag',
        action: '/ca',
        actionText: 'Shop in the Canada',
      },
      UK: {
        name: 'United Kingdom',
        title: `It looks like you’re<br /> browsing from the United Kingdom`,
        flag: 'uk-flag',
        action: '/uk',
        actionText: 'Shop in the United Kingdom',
      },
    };
    const content = CONTENT[countryCodeByIP];
    return (
      <div
        className={style.countrySelect}
        onClick={(e) => {
          if (e.target.classList.contains(style.countrySelect)) {
            this.handleSelectCountry();
          }
        }}
      >
        <div className={`${style.countrySelect}__container`}>
          <div className={`${style.countrySelect}__box`}>
            <h2
              className={`${style.countrySelect}__title`}
              dangerouslySetInnerHTML={{
                __html: content.title,
              }}
            />
            <div className={`${style.countrySelect}__intro`}>Would you like to shop our site in your country?</div>
            <a
              className={`${style.countrySelect}__action`}
              href={content.action}
              onClick={(e) => this.handleSelectCountry(e, countryCodeByIP)}
            >
              <span>{content.actionText}</span>
              <SvgIcon name="line-right-arrow" />
            </a>
            <CloseBtn onClick={this.handleSelectCountry} className={`${style.countrySelect}__close`} />
          </div>
          <a role="button" className={`${style.countrySelect}__link`} onClick={this.handleSelectCountry}>
            Stay on the {CONTENT[__COUNTRY__].name} site
          </a>
        </div>
      </div>
    );
  }
}
