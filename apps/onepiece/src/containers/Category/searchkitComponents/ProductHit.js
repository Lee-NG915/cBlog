import React from 'react';
import PropTypes from 'prop-types';
import Product from 'components/Product';
import { SearchkitManager } from 'searchkit';
import { hitsPerPage } from 'config';

const ProductHit = (props, context) => {
  const pageIndex = +context.router.location.query.p || 1;

  let contentGroup1;
  const la = context.path.split('/');
  if (la.length > 2) {
    contentGroup1 = 'Category';
  } else if (context.path === '/search') {
    contentGroup1 = 'Search';
  } else {
    contentGroup1 = 'Promotion';
  }

  const listPosition = props.index + 1 + hitsPerPage * (pageIndex - 1);
  const { lazy = true } = props;
  return (
    <Product
      listName={`${contentGroup1} - ${context.path}`}
      listPosition={listPosition}
      product={props.result._source}
      lazy={lazy}
    />
  );
};

ProductHit.contextTypes = {
  searchkit: PropTypes.instanceOf(SearchkitManager),
  path: PropTypes.string,
  router: PropTypes.object,
};

export default ProductHit;
