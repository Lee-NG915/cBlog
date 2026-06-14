'use client';

import React, { useState } from 'react';
import { IconButton, Box } from '@castlery/fortress';
import { Search } from '@castlery/fortress/Icons';
import { SearchBar } from '../search-bar/search-bar';

const FlexSearchBar = () => {
  const [isSearching, setIsSearching] = useState(false);
  return (
    <>
      <SearchBar isHidden={!isSearching} handleClose={() => setIsSearching(false)} />
      <IconButton
        size="md"
        title="Search"
        onClick={() => {
          setIsSearching(true);
        }}
      >
        <Search
          sx={(theme) => ({
            display: isSearching ? 'none' : 'block',
            width: theme.spacing(6),
            height: theme.spacing(6),
            color: theme.palette.brand.mono[900],
          })}
        />
        <Box
          sx={{
            display: isSearching ? 'block' : 'none',
            width: '24px',
          }}
        />
      </IconButton>
    </>
  );
};

export { FlexSearchBar };
