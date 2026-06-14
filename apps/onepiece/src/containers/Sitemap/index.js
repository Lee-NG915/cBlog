import React from 'react';
import { useSelector } from 'react-redux';
import { wrapPage } from 'utils/page';
import { Link } from 'react-router';
import { getCategories } from 'pages';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { loadIfNeeded as loadSitemap } from 'redux/modules/sitemap';
import Spinner from 'components/Spinner';
import { Container, Typography } from '@castlery/fortress';
import style from './style.scss';

const Sitemap = () => {
  const sitemapData = useSelector((state) => state.sitemap);
  const topCategories = getCategories();

  return (
    <Container fixed className={`${style.sitemap}`}>
      <Typography level="h1">Sitemap</Typography>

      <section className={`${style.sitemap}__section`}>
        <Typography level="h3">Category</Typography>
        <div className={`${style.sitemap}__column`}>
          {topCategories?.map((item) => (
            <ul key={item.key} className={`${style.sitemap}__column__child`}>
              <li>
                <Typography level="subh2" sx={{ color: '#844025' }}>
                  {item.name}
                </Typography>
              </li>
              {item?.children?.map((subItem) => (
                <li key={subItem.key}>
                  <Link href={`${__BASE_URL__}${subItem.url}`}>{subItem.name || subItem.key}</Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {sitemapData?.loading && (
        <div className={`${style.sitemap}__loading`}>
          <Spinner />
        </div>
      )}

      {sitemapData?.data?.map((item) => {
        if (item.key === 'Blogs') {
          return null;
        }
        return (
          <section key={item.key} className={`${style.sitemap}__section`}>
            <Typography level="h3">{item.key}</Typography>
            <ul className={`${style.sitemap}__column`}>
              {item?.children?.map((subItem) => (
                <li key={subItem.key}>
                  {subItem.href ? (
                    <a href={`${subItem.href}`}>{subItem.name || subItem.key}</a>
                  ) : (
                    <Link level="body1" href={`${__BASE_URL__}${subItem.url}`}>
                      {subItem.name === 'New In' ? subItem.key || subItem.name : subItem.name || subItem.key}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </Container>
  );
};

export default asyncLoad([({ store: { dispatch } }) => dispatch(loadSitemap())])(wrapPage()(Sitemap));
