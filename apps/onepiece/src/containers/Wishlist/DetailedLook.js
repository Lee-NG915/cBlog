import React, { useEffect, useState } from 'react';
import SvgIcon from 'components/SvgIcon';
import ReactPicture from 'components/ReactPicture';
import ApiClient from 'helpers/ApiClient';
import Spinner from 'components/Spinner';
import Variant from 'components/VariantList/Variant';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import PropTypes from 'prop-types';
import style from './style.scss';

export default function DetailedLook({ showTheLookDetail, setShowTheLookDetail }) {
  const client = new ApiClient();
  const [variants, setVariants] = useState(null);
  const { desktop } = useBreakpoints();
  useEffect(() => {
    client
      .get('/variants', {
        params: {
          ids: showTheLookDetail.variant_ids.toString(),
        },
      })
      .then((result) => {
        setVariants(result);
      });
  }, []);

  return (
    <div className={`${style.detailedLook}`}>
      <button
        type="button"
        onClick={() => {
          setShowTheLookDetail(null);
        }}
      >
        <SvgIcon name="arrow-prev" color="primary" width={15} height={15} />
        Back
      </button>
      <div className={`${style.detailedLook}__container`}>
        <ReactPicture srcset={showTheLookDetail.background_image} />
        <div className={`${style.detailedLook}__info`}>
          <h1>In This Look</h1>
          {variants?.length > 0 ? <span>{variants.length} products displayed</span> : ''}
        </div>
        {variants === null ? (
          <div style={{ height: '200px', position: 'relative' }}>
            <Spinner />
          </div>
        ) : (
          <div className={`${style.detailedLook}__variantsContainer`}>
            {variants.map((variant, i) => (
              <Variant
                className={`${style.detailedLook}__variant`}
                key={variant.id}
                variant={variant}
                lazy={desktop ? i >= 8 : i > 2}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
DetailedLook.propTypes = {
  showTheLookDetail: PropTypes.shape({
    background_image: PropTypes.string,
    variant_ids: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
  setShowTheLookDetail: PropTypes.func.isRequired,
};
