import React from 'react';
import { GhostArrowBtn } from 'components/Button';
import VariantList from 'components/VariantList';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useBreakpoints } from '@castlery/fortress/hooks';
import style from '../style.scss';

const RecommendSection = ({ linkCollection, link, campaign }) => {
  const { desktop } = useBreakpoints();
  const data = useSelector((state) => state.variantList[linkCollection.permalink]?.data || {});
  return (
    <div className={style.recommend} data-campaign={campaign}>
      {data.title && (
        <div className={`${style.recommend}__header`}>
          <h2>{data.title}</h2>
          {data.cta_link && desktop && (
            <GhostArrowBtn
              className={`${style.recommend}__btnDesktop`}
              text={data.cta_text || 'View All'}
              border={false}
              href={data.cta_link}
            />
          )}
        </div>
      )}

      {data.variants && <VariantList containerSize="normal" variants={data.variants} listName="Home - recommend" />}
      {data.cta_link && !desktop && (
        <GhostArrowBtn
          className={`${style.recommend}__btnMobile`}
          text={data.cta_text || 'View All'}
          href={data.cta_link}
        />
      )}
    </div>
  );
};
RecommendSection.propTypes = {
  linkCollection: PropTypes.object,
  campaign: PropTypes.string,
};

export default RecommendSection;
