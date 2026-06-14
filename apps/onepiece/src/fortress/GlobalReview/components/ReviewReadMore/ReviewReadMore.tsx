import Box from '@mui/joy/Box';
import { Button } from 'fortress/Button';
import * as React from 'react';

type ReviewReadMoreProps = {
  handleClick: () => void;
};

const ReviewReadMore = ({ handleClick }: ReviewReadMoreProps) => {
  return (
    <Box
      sx={() => ({
        marginTop: 7,
      })}
    >
      <Button
        onClick={handleClick}
        sx={(theme) => ({
          width: '358px',
          border: `${theme.palette.brand.charcoal[800]} 1px solid`,
          bgcolor: '#fff',
          color: theme.palette.brand.charcoal[800],
          ':hover': {
            bgcolor: '#fff',
            color: theme.palette.brand.charcoal[800],
          },
          ':active': {
            bgcolor: '#e2dbc9',
            color: theme.palette.brand.charcoal[800],
            boxShadow: 'none',
          },
        })}
      >
        Read All Reviews
      </Button>
    </Box>
  );
};

export default ReviewReadMore;
