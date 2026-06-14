import React from 'react';
import { hitsPerPage } from 'config';
import { Hits, NoHits, Pagination } from 'searchkit';
import SvgIcon from 'components/SvgIcon';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { ProductHitsList, ProductHit, ProductHitError, ProductNoHit } from '../searchkitComponents';
import style from './style.scss';

const CustomHits = () => {
  const { desktop } = useBreakpoints();
  return (
    <>
      <Hits
        mod={style.hits}
        hitsPerPage={hitsPerPage}
        listComponent={ProductHitsList}
        itemComponent={ProductHit}
        scrollTo={__CLIENT__ ? 'html' : false}
      />
      <NoHits mod={style.noHits} component={ProductNoHit} errorComponent={ProductHitError} />
      <Pagination
        mod={style.pagination}
        showNumbers
        pageScope={!desktop ? 1 : 2}
        translations={{
          'pagination.previous': <SvgIcon name="line-left-arrow" hoverColor="primary" />,
          'pagination.next': <SvgIcon name="line-right-arrow" hoverColor="primary" />,
        }}
      />
    </>
  );
};

export default CustomHits;
