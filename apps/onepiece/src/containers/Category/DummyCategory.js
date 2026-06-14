import React from 'react';
import PropTypes from 'prop-types';
import { SearchkitProvider, ResetFilters } from 'searchkit';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { Hits, Filters, Sorting } from './components';

const DummyCategory = ({ searchkit, hasCategoryFilter, isAllCategory, taxonomyPermalink, device }) => {
  // const breakpoints = useBreakpoints();
  // const { desktop } = breakpoints;
  const desktop = device === 'desktop';
  return (
    <SearchkitProvider searchkit={searchkit}>
      {!desktop ? (
        <div>
          <Sorting />
          <Hits scrollTo={false} />
          <ResetFilters options={{ pagination: false, query: true, filter: true }} />
          <Filters
            hasCategoryFilter={hasCategoryFilter}
            isAllCategory={isAllCategory}
            taxonomyPermalink={taxonomyPermalink}
          />
        </div>
      ) : (
        <div>
          <Sorting />
          <ResetFilters options={{ pagination: false, query: true, filter: true }} />
          <Filters
            hasCategoryFilter={hasCategoryFilter}
            isAllCategory={isAllCategory}
            taxonomyPermalink={taxonomyPermalink}
          />
          <Hits scrollTo={false} />
        </div>
      )}
    </SearchkitProvider>
  );
};

DummyCategory.propTypes = {
  searchkit: PropTypes.object,
  hasCategoryFilter: PropTypes.bool,
  isAllCategory: PropTypes.bool,
  taxonomyPermalink: PropTypes.string,
  device: PropTypes.string,
};

export default DummyCategory;
