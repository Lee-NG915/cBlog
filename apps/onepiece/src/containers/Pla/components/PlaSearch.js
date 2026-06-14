import React from 'react';
import SearchInput from 'components/SearchBar/SearchInput';

import { Search } from '@castlery/fortress/Icons';
import style from '../style.scss';

const PlaSearch = () => (
  <div className={style.plaSearch}>
    <SearchInput
      suggestionPadding={false}
      placeholder={
        <div className={`${style.plaSearch}__placeholder`}>
          <Search sx={{ mr: '10px' }} />
          What are you looking for?
        </div>
      }
    />
  </div>
);

export default PlaSearch;
