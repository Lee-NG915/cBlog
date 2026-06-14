import React from 'react';
import PropTypes from 'prop-types';
import ProductOrigin from 'components/Product';
import style from './style.scss';

const Product = ({ product, name, listName, listPosition, link, rootRef, isRootShown, isUsedInPDP, ...rest }) => (
  <div className={style.item} {...rest}>
    <ProductOrigin
      showHover={false}
      listName={listName}
      listPosition={listPosition}
      product={product}
      rootRef={rootRef}
      isRootShown={isRootShown}
      link={link}
      isUsedInPDP={isUsedInPDP}
    />
  </div>
);

Product.propTypes = {
  product: PropTypes.object,
  name: PropTypes.string,
  listName: PropTypes.string,
  listPosition: PropTypes.number,
  link: PropTypes.string,
  rootRef: PropTypes.object,
  isRootShown: PropTypes.bool,
  isUsedInPDP: PropTypes.bool,
};

export default Product;
