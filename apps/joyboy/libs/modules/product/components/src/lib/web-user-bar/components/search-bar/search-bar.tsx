import React from 'react';
import { Stack } from '@castlery/fortress';
import { SearchInput } from '../search-input/search-input';

type SearchBarProps = {
  handleClose: () => void;
  isHidden: boolean;
};

const SearchBar = ({ handleClose, isHidden }: SearchBarProps) => {
  return (
    <Stack
      sx={{
        position: 'absolute',
        zIndex: 3,
        top: 0,
        bottom: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        visibility: isHidden ? 'hidden' : 'visible',
      }}
    >
      <SearchInput isHidden={isHidden} handleClose={handleClose} onClose={handleClose} />
    </Stack>
  );
};

export { SearchBar };
