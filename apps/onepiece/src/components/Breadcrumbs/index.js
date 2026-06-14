import React from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import { getUrl, getBreadcrumbsByPathname, getTopCategoriesConfig } from 'pages';
import { Container } from '@castlery/fortress';
import style from './style.scss';

/**
 * @description  Link only suport in Router, like Career entry not use Router
 */
// eslint-disable-next-line react/prop-types
const CustomLink = ({ useLink = true, to = '', href = '', children }) => {
  if (href !== '') {
    return <a href={href}>{children}</a>;
  }
  return (
    <>
      {useLink ? (
        <Link to={to} href={href}>
          {children}
        </Link>
      ) : (
        <a href={to}>{children}</a>
      )}
    </>
  );
};

const Breadcrumbs = ({ location = {}, showHome = true, customBreadcrumbs, useLink = true, className }) => {
  const breadcrumbs =
    location.state?.breadcrumbs || getBreadcrumbsByPathname(location.pathname) || customBreadcrumbs || [];

  if (breadcrumbs?.length === 0) {
    return null;
  }

  return (
    <Container className={`${className}`}>
      <div className={`${style.breadcrumbs}`}>
        {showHome && (
          <span>
            <CustomLink
              useLink={useLink}
              href={`https://www${
                __APPLICATION_ENV__.includes('test') ? '-test' : __APPLICATION_ENV__.includes('uat') ? '-uat' : ''
              }.castlery.com/${__COUNTRY__.toLocaleLowerCase()}/`}
            >
              Home
            </CustomLink>
            <span className={`${style.breadcrumbs}__divide`}>&gt;</span>
          </span>
        )}
        {breadcrumbs.map((a, index) => {
          if (index < breadcrumbs.length - 1) {
            const url = a?.customUrl ? a.customUrl : getTopCategoriesConfig()?.[a?.permalink];
            return (
              <span key={index}>
                {url ? (
                  <CustomLink useLink={useLink} to={url}>
                    {a.name || a.metaTitle}
                  </CustomLink>
                ) : (
                  a.name || a.metaTitle
                )}
                <span className={`${style.breadcrumbs}__divide`}>&gt;</span>
              </span>
            );
          }
          return (
            <span key={index} className="is-active">
              {a.name || a.title}
            </span>
          );
        })}
      </div>
    </Container>
  );
};

Breadcrumbs.propTypes = {
  location: PropTypes.object,
  showHome: PropTypes.bool,
  customBreadcrumbs: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),
  useLink: PropTypes.bool,
  className: PropTypes.string,
};

export default Breadcrumbs;
