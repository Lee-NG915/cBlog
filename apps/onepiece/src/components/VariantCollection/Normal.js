import React from 'react';
import { Link } from 'react-router';

import VariantList from 'components/VariantList';
import VariantCollectionContainer from './Container';

import style from './style.scss';

const VariantCollection = ({ name, listName, className }) => (
  <VariantCollectionContainer name={name}>
    {(variantList) => (
      <div className={`${style.variantCollection} ${className}`}>
        <div className={`${style.variantCollection}__header`}>
          <h4 className={`${style.variantCollection}__header-title`}>{variantList.title}</h4>
          {variantList.intro && (
            <div
              className={`${style.variantCollection}__header-desc`}
              dangerouslySetInnerHTML={{ __html: variantList.intro }}
            />
          )}
          <Link className={`${style.variantCollection}__action`} to={variantList.cta_link}>
            {variantList.cta_text} >
          </Link>
        </div>

        <div className={`${style.variantCollection}__listContainer`}>
          <VariantList containerSize="normal" variants={variantList.variants} listName={listName} />
        </div>
      </div>
    )}
  </VariantCollectionContainer>
);

export default VariantCollection;
