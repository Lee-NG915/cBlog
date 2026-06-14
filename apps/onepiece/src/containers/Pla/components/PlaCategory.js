import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router';
import { getPageByKey } from 'pages';
import ReactPicture from 'components/ReactPicture';
import { useAncestorCrumbs } from 'containers/Product/hooks/product';
import { GhostArrowBtn } from 'components/Button';
import findLast from 'lodash/findLast';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Container } from '@castlery/fortress';
import style from '../style.scss';

const PlaSection = (props = {}) => {
  const { campaign = 'SSC PDP Recommendation Widget #1' } = props;
  const { ancestorCrumbs = [] } = useAncestorCrumbs();
  let page = useMemo(() => getPageByKey(ancestorCrumbs[0]?.key), [ancestorCrumbs]);
  let links = page ? page.children : [];
  const { desktop } = useBreakpoints();
  if (links.length === 0) {
    page = {
      url: '/all-products',
      name: 'Furniture',
    };
  } else {
    page = {
      ...page,
      url: findLast(links, (l) => l.key?.includes('all'))?.url || links[0].url,
    };
    links = links.filter((i) => !i.key?.includes('all')).slice(0, 6);
  }
  return (
    <>
      <Container
        className={classNames({
          [style.dyPosition]: true,
        })}
      >
        <div data-campaign={campaign} />
      </Container>
      <div className={style.plaSection}>
        <div className={`${style.plaSection}__title`}>
          <h2>Complete your dream home with these modern picks.</h2>
        </div>
        <Container
          fixed
          sx={{
            display: 'grid',
            gridGap: '50px',
            justifyContent: 'center',
            gridTemplateColumns: {
              xs: `repeat(2, 1fr)`,
              md: `repeat(auto-fit, minmax(150px, 200px))`,
            },
          }}
        >
          {links.map((i) => (
            <div className={`${style.plaSection}__item`} key={i.key}>
              <Link to={i.url}>
                <ReactPicture src={i.thumbnail} alt={i.name} loader={{ ratio: 0.67, size: 'cover' }} />
                <h3>{i.name}</h3>
              </Link>
            </div>
          ))}
        </Container>
        <div className={`${style.plaSection}__footer`}>
          <GhostArrowBtn text={`Shop All ${page.name}`} href={page.url} />
        </div>
      </div>
    </>
  );
};

PlaSection.propTypes = {
  campaign: PropTypes.string,
};

export default PlaSection;
