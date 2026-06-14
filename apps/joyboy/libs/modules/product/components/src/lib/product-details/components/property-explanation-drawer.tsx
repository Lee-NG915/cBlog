'use client';

import { Box, DialogTitle, Drawer, ModalClose, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { ArrowBackIosNew } from '@castlery/fortress/Icons';
import { DynamicDialogContent } from '@castlery/shared-fortress-client';

interface PropertyExplanationDrawerProps {
  open: boolean;
  onClose: () => void;
  explanation?: string;
}

export const PropertyExplanationDrawer = (props: PropertyExplanationDrawerProps) => {
  const { open, onClose, explanation } = props;
  const { desktop } = useBreakpoints();

  if (!explanation) {
    return null;
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor={desktop ? 'right' : 'bottom'}
      mobileCloseButton={false}
      size="md"
      sx={{
        ...(!desktop && {
          '--Drawer-verticalSize': '80vh',
        }),
      }}
    >
      <DialogTitle sx={{ py: { xs: 4, md: 5 }, px: { xs: 4, md: 6 }, m: 0 }}>
        <Typography
          level="h4"
          startDecorator={<ArrowBackIosNew />}
          sx={{
            cursor: 'pointer',
          }}
          onClick={onClose}
        >
          Back
        </Typography>
      </DialogTitle>

      <DynamicDialogContent>
        <Box
          px={6}
          dangerouslySetInnerHTML={{ __html: explanation }}
          sx={(theme) => ({
            ...theme.typography,
            strong: {
              ...theme.typography.h5,
            },
            b: {
              ...theme.typography.h5,
            },
            ul: {
              ...theme.typography.body2,
            },
            li: {
              ...theme.typography.body2,
            },
            p: {
              ...theme.typography.body2,
            },
            a: {
              textDecorationColor: 'var(--fortress-palette-warning-500) !important',
            },
            'h3:first-of-type': {
              marginTop: 0,
            },
          })}
        />
      </DynamicDialogContent>
    </Drawer>
  );
};
