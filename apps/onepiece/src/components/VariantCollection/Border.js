import React from 'react';

import Variant from 'components/VariantList/Variant';
import { Container } from '@castlery/fortress';
import VariantCollectionContainer from './Container';

import style from './style.scss';

const VariantCollectionBorder = ({ name, listName }) => (
  <VariantCollectionContainer name={name}>
    {(variantList) => (
      <Container maxWidth="md" className={`${style.variantCollectionBorder}`}>
        <div className={`${style.variantCollectionBorder}__header`}>
          <h4 className={`${style.variantCollectionBorder}__header-title`}>{variantList.title}</h4>
        </div>

        <div className={`${style.variantCollectionBorder}__listContainer`}>
          {variantList.variants.map((variant, index) => (
            <Variant key={index} listName={listName} listPosition={index + 1} variant={variant} />
          ))}
        </div>
      </Container>
    )}
  </VariantCollectionContainer>
);

export default VariantCollectionBorder;
