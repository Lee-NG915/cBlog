import React from 'react';
import { Typography, Box } from '@castlery/fortress';
import { ButtonLink } from 'components/ButtonLink';
import { useDispatch } from 'react-redux';
import { getUrl } from 'pages';
import { EVENT_CAMPAIGN_PROGRESS_BAR_LINK_CLICK } from 'utils/track/constants';
import PropTypes from 'prop-types';
import style from '../style.scss';

/**
 * The title of store-wide-campaigns
 * @param {*} param0
 * @param {*} param1
 * @returns
 */
export const CampaignTitle = ({ link, campaignName, limit, label, total, variation }, { router }) => {
  const dispatch = useDispatch();
  const nameStr = campaignName?.substring(0, 49);
  const labelStr = Array.isArray(label) ? label.reduce((acr, cur) => acr + cur.replace('&', 'and'), '') : label;
  const triggerCampaignEvent = React.useCallback(() => {
    router?.push(link);
    dispatch({
      type: EVENT_CAMPAIGN_PROGRESS_BAR_LINK_CLICK,
      result: {
        position: variation,
        campaignName,
        discount: label,
      },
    });
  }, [variation, router, dispatch, campaignName, label, link]);
  return (
    <Typography>
      {link ? <ButtonLink handler={triggerCampaignEvent}>{nameStr}</ButtonLink> : <Typography>{nameStr}</Typography>}:
      Spend ${limit - total} more to get {labelStr}!
    </Typography>
  );
};
CampaignTitle.propTypes = {
  link: PropTypes.string,
  campaignName: PropTypes.string,
  limit: PropTypes.number,
  label: PropTypes.string,
  total: PropTypes.number,
  variation: PropTypes.string,
};
CampaignTitle.contextTypes = {
  router: PropTypes.object,
};

/**
 * The title of free-shipping
 * @param {*} param0
 * @returns
 */
export const FreeShippingTitle = ({ usingTotal, limit }) => (
  <Typography>
    {usingTotal < limit
      ? `Spend $${Math.round(limit - usingTotal)} more to get Free Shipping!`
      : `Congratulations! Free Shipping unlocked.`}
  </Typography>
);
FreeShippingTitle.propTypes = {
  usingTotal: PropTypes.number,
  limit: PropTypes.number,
};

/**
 * The title of gift promotion
 * @param {*} param0
 * @returns
 */
export const GiftPromotionTitle = ({ total, limit, giftAvailable, handler }) => {
  if (giftAvailable) {
    return (
      <Typography>
        Congratulations! Free Gift unlocked.
        <ButtonLink handler={handler}>
          <Typography sx={{ ml: 0.5 }}>{'Choose Gift >'}</Typography>
        </ButtonLink>
      </Typography>
    );
  }
  return (
    <Typography>
      Spend ${limit - total} more to get Free Gift!
      <ButtonLink handler={handler}>
        <Typography sx={{ ml: 0.5 }}>{'Learn More >'}</Typography>
      </ButtonLink>
    </Typography>
  );
};
GiftPromotionTitle.propTypes = {
  total: PropTypes.number,
  limit: PropTypes.number,
  giftAvailable: PropTypes.bool,
  handler: PropTypes.func,
};

/**
 * The banner of free-gift
 * @param {*} param0
 * @returns
 */
export const FreeGiftBanner = ({ handler }) => (
  <Box
    role="button"
    className={`${style.promotionHint}__promo`}
    onClick={handler}
    sx={{ '.MuiBox-root': { padding: 0 } }}
  >
    <Typography className={`${style.promotionHint}__promo-label`}>
      <strong>Free Gift Unlocked!</strong> {' Choose Gift >'}
    </Typography>
    <Typography className={`${style.promotionHint}__promo-badge`}>FREE!</Typography>
  </Box>
);
FreeGiftBanner.propTypes = {
  handler: PropTypes.func,
};
