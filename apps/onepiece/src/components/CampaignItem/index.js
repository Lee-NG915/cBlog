import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import { getPageByKey } from 'pages';
import { renderImage } from 'utils/image';

import style from './style.scss';

const CampaignItem = ({ campaign }) => {
  const campaignPage = getPageByKey(campaign.key);
  return (
    <div className={style.campaignItem}>
      <Link to={campaignPage.url}>
        {renderImage(campaign.img.src, campaign.img.ratio, campaign.img.widthRate, { alt: campaign.title })}
      </Link>
      <h4 className={`${style.campaignItem}__title`}>{campaign.title}</h4>
      <div className={`${style.campaignItem}__desc`}>{campaign.desc}</div>
    </div>
  );
};

CampaignItem.propTypes = {
  campaign: PropTypes.object,
};

export default CampaignItem;
