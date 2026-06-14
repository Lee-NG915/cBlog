import React from 'react';
import PropTypes from 'prop-types';

const ProductHitsList = ({ hits, mod, className, itemComponent: ItemComponent }) => (
  <div data-qa="hits" className={`${mod} ${className}`}>
    {hits.map((result, index) => (
      <ItemComponent key={result._id} index={index} result={result} lazy={index >= 3} />
    ))}
  </div>
);

ProductHitsList.propTypes = {
  hits: PropTypes.array,
  mod: PropTypes.string,
  className: PropTypes.string,
  itemComponent: PropTypes.func,
};

export default ProductHitsList;
