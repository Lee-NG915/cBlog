import React from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';
import { isOutdated } from 'utils/time';
import classNames from 'classnames';
import { Container } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import Input from './Input';
import style from './style.scss';

const NormalBar = (props, context) => {
  const { desktop } = useBreakpoints();
  const device = desktop ? 'desktop' : 'mobile';
  const isGiveawayValid = !isOutdated('2021-03-15 00:00', '2021-03-22 00:00');
  const content = {
    SG: {
      desktop: 'Exclusive offers, new arrivals, inspiration and more! Subscribe to our newsletter today.',
      mobile: 'Get exclusive offers & updates!',
    },
    AU: {
      desktop: isGiveawayValid
        ? 'Join us and stand to win a $270 gift voucher!*'
        : `Subscribe to our newsletter today.`,
      mobile: isGiveawayValid
        ? 'Join us and stand to win a $270 gift voucher!*'
        : 'Curious for more? Join our mailing list.',
    },
    US: {
      desktop: isGiveawayValid
        ? 'Join us and stand to win a $270 gift voucher!*'
        : 'Exclusive deals, new arrivals, inspiration & more.',
      mobile: isGiveawayValid
        ? 'Join us and stand to win a $270 gift voucher!*'
        : 'Curious for more? Join our mailing list.',
    },
  };

  const { isUsedInPDP } = props;

  return (
    <div
      className={classNames(`${style.normal}`, {
        [`${style.pdpNormal}`]: isUsedInPDP,
      })}
    >
      <Container fixed>
        {!desktop ? (
          <div
            className={classNames(`${style.normal}__mContainer`, {
              [`${style.pdpNormal}__mContainer`]: isUsedInPDP,
            })}
          >
            <p>{content[__COUNTRY__]?.[device]}</p>
            <Input
              isUsedInPDP={isUsedInPDP}
              type="FOOTER"
              onSuccess={() =>
                context.frame.openModal('response', {
                  status: 'successful',
                  title: 'Thank You!',
                  body: 'You have successfully subscribed to the newsletter.',
                })
              }
            />
          </div>
        ) : (
          <div className={`${style.normal}__dContainer`}>
            <ReactSVG name="usp-3" />
            <p>{content[__COUNTRY__]?.[device]}</p>
            <Input
              type="FOOTER"
              onSuccess={() =>
                context.frame.openModal('response', {
                  status: 'successful',
                  title: 'Thank You!',
                  body: 'You have successfully subscribed to the newsletter.',
                })
              }
            />
          </div>
        )}
      </Container>
    </div>
  );
};

NormalBar.propTypes = {
  isUsedInPDP: PropTypes.bool,
};

NormalBar.defaultProps = {
  isUsedInPDP: false,
};

NormalBar.contextTypes = {
  frame: PropTypes.object,
};

export default NormalBar;
