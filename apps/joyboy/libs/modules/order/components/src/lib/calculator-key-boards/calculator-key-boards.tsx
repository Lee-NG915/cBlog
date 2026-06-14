'use client';

import React from 'react';
import { Grid, Button, IconButton } from '@castlery/fortress';
import { Cancel } from '@castlery/fortress/Icons';

export enum KeyBoards {
  'key_1' = '1',
  'key_2' = '2',
  'key_3' = '3',
  'key_4' = '4',
  'key_5' = '5',
  'key_6' = '6',
  'key_7' = '7',
  'key_8' = '8',
  'key_9' = '9',
  'key_dot' = '.',
  'key_0' = '0',
  'key_reset' = '',
}
interface CalculatorKeyBoardsProps {
  onChange: (key: keyof typeof KeyBoards) => void;
}
export const CalculatorKeyBoards: React.FC<CalculatorKeyBoardsProps> = ({ onChange }) => {
  const keys = Object.keys(KeyBoards).map((key) => ({
    key: key as keyof typeof KeyBoards,
    value: KeyBoards[key as keyof typeof KeyBoards],
  }));

  return (
    <Grid
      container
      sx={{
        flexGrow: 1,
      }}
    >
      {keys.map(({ key, value }) => (
        <Grid
          key={key}
          xs={4}
          sx={{
            height: 60,
            lineHeight: '60px',
            textAlign: 'center',
            fontSize: 19,
            border: (theme) => `1px solid ${theme.palette.brand.charcoal[200]}`,
          }}
        >
          {key === 'key_reset' ? (
            <IconButton
              sx={{
                width: '100%',
                height: '100%',
                color: (theme) => theme.palette.brand.charcoal[800],
                fontSize: 'xl',
              }}
              onClick={() => onChange(key)}
            >
              <Cancel />
            </IconButton>
          ) : (
            <Button
              variant="tertiary"
              sx={{
                width: '100%',
                height: '100%',
                color: (theme) => theme.palette.brand.charcoal[800],
                fontSize: 'xl',
              }}
              onClick={() => onChange(key)}
            >
              {value}
            </Button>
          )}
        </Grid>
      ))}
    </Grid>
  );
};

export default CalculatorKeyBoards;
