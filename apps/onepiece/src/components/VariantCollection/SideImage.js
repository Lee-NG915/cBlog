import React from 'react';
import { Link } from 'react-router';

import VariantList from 'components/VariantList';
import { renderImage } from 'utils/image';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import VariantCollectionContainer from './Container';
import style from './style.scss';

const VariantCollectionSideImage = ({ name, listName, imgPath }) => {
  const { desktop } = useBreakpoints();
  const device = desktop ? 'desktop' : 'mobile';
  return (
    <VariantCollectionContainer name={name}>
      {(variantList) => (
        <div className={style.variantCollectionSideImage}>
          <div className={`${style.variantCollectionSideImage}__banner`}>
            <Link to={variantList.cta_link}>
              {renderImage(`${imgPath}/${name}-${device}.jpg`, desktop ? 1.18577 : 0.37333, desktop ? 0.2 : 1, {
                alt: name,
              })}
            </Link>
            <div className={`${style.variantCollectionSideImage}__header`}>
              <h4 className={`${style.variantCollectionSideImage}__header-title`}>{variantList.title}</h4>
              <Link to={variantList.cta_link}>{variantList.cta_text}</Link>
            </div>
          </div>

          <div className={`${style.variantCollectionSideImage}__listContainer`}>
            <VariantList variants={variantList.variants} listName={listName} />
          </div>
        </div>
      )}
    </VariantCollectionContainer>
  );
};

export default VariantCollectionSideImage;
