import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { getUrl } from 'pages';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { useCurrentProduct } from '../hooks/product';
import style from './style.scss';

const Breadcrumbs = ({ ancestorCrumbs }) => {
  const product = useCurrentProduct();
  const { desktop } = useBreakpoints();
  return (
    <div className={`${style.breadcrumbs}`}>
      {desktop && (
        <span>
          <Link href={__BASE_URL__}>Home</Link>
          <span className={`${style.breadcrumbs}__divide`}>&gt;</span>
        </span>
      )}
      {ancestorCrumbs.map((a, index) => (
        <span key={index}>
          {!a.url ? a.name || a.title : <Link to={a.url}>{a.name || a.title}</Link>}
          <span className={`${style.breadcrumbs}__divide`}>&gt;</span>
        </span>
      ))}
      {desktop && (
        <span className="is-active">
          {product.name}
          <span className={`${style.breadcrumbs}__divide`}>&gt;</span>
        </span>
      )}
    </div>
  );
};

Breadcrumbs.propTypes = {
  ancestorCrumbs: PropTypes.array.isRequired,
};

export default Breadcrumbs;
