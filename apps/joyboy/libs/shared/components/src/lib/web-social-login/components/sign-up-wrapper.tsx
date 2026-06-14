'use client';

import { Box } from '@castlery/fortress';

interface SignUpWrapperProps {
  children: React.ReactNode;
  onClick: () => void;
  agreeTerms: boolean;
}

export const SignUpWrapper = (props: SignUpWrapperProps) => {
  const { children, onClick, agreeTerms } = props;
  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      {children}
      {!agreeTerms && (
        <Box
          sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 2 }}
          onClick={onClick}
        />
      )}
    </Box>
  );
};
