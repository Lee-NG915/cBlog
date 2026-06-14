// Modal.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';
import { Modal, ModalClose, ModalProps, ModalDialog } from './index';
import React from 'react';
import { Box, Button, Typography } from '..';
import { ErrorTips } from '../Icons';
const meta: Meta<ModalProps> = {
  title: 'Components/Modal',
  component: Modal,
};

export default meta;
type Story = StoryObj<ModalProps>;

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/react/api/csf
 * to learn how to use render functions.
 */
export const Basic: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
          data-testid="title"
        >
          <ModalDialog>
            <ModalClose />
            <Typography
              id="modal-title"
              level="h3"
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              startDecorator={<ErrorTips width="36px" height="36px" />}
            >
              This is a H3 title This is a H3 titleThis is a H3 titleThis is a H3 titleThis is a H3 titleThis is a H3
              titleThis is a H3 title
            </Typography>
            <Typography id="modal-desc" textColor="text.tertiary">
              Make sure to use <code>aria-labelledby</code> on the modal dialog with an optional{' '}
              <code>aria-describedby</code> attribute.
            </Typography>
            <Button variant="primary">Confirm</Button>
            <Button variant="secondary">Cancel</Button>
          </ModalDialog>
        </Modal>
      </React.Fragment>
    );
  },
};

export const InFixedContainer: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = React.useState<boolean>(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    return (
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '50%',
          height: '500px',
          overflow: 'hidden',
          padding: 4,
          background: 'var(--fortress-palette-brand-warmLinen-500)',
        }}
      >
        <Button variant="outlined" color="neutral" onClick={() => setOpen(true)}>
          Open modal in container
        </Button>

        <Modal
          aria-labelledby="container-modal-title"
          aria-describedby="container-modal-desc"
          open={open}
          onClose={() => setOpen(false)}
          container={() => containerRef.current}
          disablePortal={false}
          slotProps={{
            root: { sx: { position: 'absolute', inset: 0 } },
            backdrop: { sx: { position: 'absolute', inset: 0 } },
          }}
        >
          <ModalDialog>
            <ModalClose />
            <Typography id="container-modal-title" level="h4" sx={{ mb: 1 }}>
              Modal in container
            </Typography>
            <Typography id="container-modal-desc" textColor="text.tertiary" sx={{ mb: 2 }}>
              This modal is rendered and constrained within the dashed container via Portal container.
            </Typography>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </ModalDialog>
        </Modal>
      </Box>
    );
  },
};
