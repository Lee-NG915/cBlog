// Modal.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';

import { Modal, ModalClose, ModalProps } from './index';
import React from 'react';
import { Button, Container, Sheet, Stack, Typography } from 'fortress';

const meta: Meta<ModalProps> = {
  title: 'fortress / Modal',
  component: Modal,
};

export default meta;
type Story = StoryObj<ModalProps>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  render: () => {
    const [open, setOpen] = React.useState<boolean>(false);
    return (
      <React.Fragment>
        <Button variant="outlined" color="neutral" onClick={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal
          aria-labelledby="modal-title"
          aria-describedby="modal-desc"
          open={open}
          onClose={() => setOpen(false)}
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <Sheet
            variant="outlined"
            sx={{
              maxWidth: 500,
              borderRadius: 'md',
              p: 3,
              boxShadow: 'lg',
            }}
          >
            <ModalClose
              variant="outlined"
              sx={{
                top: 'calc(-1/4 * var(--IconButton-size))',
                right: 'calc(-1/4 * var(--IconButton-size))',
                boxShadow: '0 2px 12px 0 rgba(0 0 0 / 0.2)',
                borderRadius: '50%',
                bgcolor: 'background.surface',
              }}
            />
            <Typography component="h2" id="modal-title" level="h4" textColor="inherit" fontWeight="lg" mb={1}>
              This is the modal title
            </Typography>
            <Typography id="modal-desc" textColor="text.tertiary">
              Make sure to use <code>aria-labelledby</code> on the modal dialog with an optional{' '}
              <code>aria-describedby</code> attribute.
            </Typography>
          </Sheet>
        </Modal>
      </React.Fragment>
    );
  },
};
const FixContainer = ({ children }) => {
  return (
    <Sheet
      sx={{
        position: 'relative',
        width: '100px',
      }}
    >
      {children}
    </Sheet>
  );
};

export const CloseColors = () => {
  return (
    <Container
      maxWidth="md"
      sx={{
        position: 'relative',
        bgcolor: (theme) => theme.palette.neutral[100],
      }}
    >
      <Typography level="h1">h1</Typography>
      <Typography>Variant</Typography>
      <Stack
        direction={'row'}
        sx={{
          position: 'relative',
        }}
      >
        <FixContainer>
          <ModalClose variant="outlined" />
          <ModalClose variant="outlined" color="primary" />
        </FixContainer>
        <FixContainer>
          <ModalClose variant="plain" />
        </FixContainer>
        <FixContainer>
          <ModalClose variant="soft" />
        </FixContainer>
        <FixContainer>
          <ModalClose variant="solid" />
        </FixContainer>
      </Stack>
    </Container>
  );
};
