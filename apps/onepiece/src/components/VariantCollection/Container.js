import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import Spinner from 'components/Spinner';
import { load as loadVariantCollection } from 'redux/modules/variantList';

import style from './style.scss';

const VariantCollectionContainer = ({ name, loadVariantCollection, variantLists, children }) => {
  useEffect(() => {
    name && loadVariantCollection(name);
  }, [loadVariantCollection, name]);

  const variantListState = variantLists[name];

  if (!variantListState || variantListState.loading) {
    return (
      <div className={`${style.variantCollectionContainer}__loading`}>
        <Spinner />
      </div>
    );
  }

  if (!variantListState.data) {
    return null;
  }

  const variantList = variantListState.data;

  return children(variantList);
};

export default connect(
  (state) => ({
    variantLists: state.variantList,
  }),
  { loadVariantCollection }
)(VariantCollectionContainer);
