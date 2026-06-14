/* eslint-disable react-hooks/rules-of-hooks */
// NiceModal.stories.ts|tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import NiceModal from './components/BaseModal';
import type { ModalFuncProps } from './components/HookModal';
import { Box, Button } from '../index';
import { useNiceModal } from './hooks/useModal';
import NestedModals from './components/NestedModal';
import {
  BaseModalStory,
  BaseModalStoryActions,
  BaseModalStorySuccess,
  BaseModalStoryInformation,
  BaseModalStoryWarning,
  BaseModalStoryDanger,
  ConfirmationModal as ConfirmationModalDemo,
} from './demos/BaseModalStory';
import { DeclarativeFormFillModal, ImperativeFormFillModal } from './demos/FormModalStory';
import { DeclarativeModal, ImperativeModal } from './demos/CommonModalStory';

const meta: Meta<ModalFuncProps> = {
  title: 'Components/Nicemodal',
  component: NiceModal,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?type=design&node-id=1339-2886&mode=design&t=sT5QJB7EVWYA8AKn-0',
    },
  },
};

export default meta;
type Story = StoryObj<ModalFuncProps>;

export const StandardModal1 = BaseModalStory;
export const StandardModal2 = BaseModalStoryActions;
export const UtilityModalSuccess = BaseModalStorySuccess;
export const UtilityModalInformation = BaseModalStoryInformation;
export const UtilityModalWarning = BaseModalStoryWarning;
export const UtilityModalDanger = BaseModalStoryDanger;
export const ConfirmationModal = ConfirmationModalDemo;
export const StandardFormModal = ImperativeFormFillModal;

export const ImperativeCommonModal = ImperativeModal;
export const DeclarativeCommonModal = DeclarativeModal;
export const ImperativeFormModal = ImperativeFormFillModal;
export const DeclarativeFormModal = DeclarativeFormFillModal;

/**
 * server - side modal
 */
export const ServerSideModal: Story = {
  args: {
    title: 'Server Side Modal',
    desc: 'Display a modal rendered on the server,you can disable the portal feature with the disablePortal prop',
    disablePortal: true,
  },
  render: (args) => {
    const [modal, contextHolder] = useNiceModal();
    const openModal = React.useCallback(
      () =>
        modal.info({
          ...args,
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [modal]
    );
    React.useEffect(() => {
      openModal();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <React.Fragment>
        <Button variant="outlined" color="neutral" onClick={openModal}>
          Open Server-Side Modal
        </Button>
        {contextHolder}
      </React.Fragment>
    );
  },
};

export const NestedModalsDemo: Story = {
  render: () => {
    return <NestedModals />;
  },
};

export const InFixedContainerWithNiceModal: Story = {
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
          width: '80%',
          height: '500px',
          overflow: 'hidden',
          padding: 4,
          background: 'var(--fortress-palette-brand-warmLinen-500)',
        }}
      >
        <Button variant="outlined" color="neutral" onClick={() => setOpen(true)}>
          Open modal in container
        </Button>

        <NiceModal
          aria-labelledby="container-modal-title"
          aria-describedby="container-modal-desc"
          open={open}
          onClose={() => setOpen(false)}
          container={() => containerRef.current}
          title="Modal in container"
          desc="This modal is rendered and constrained within the dashed container via Portal container."
          modalSlotProps={{
            root: { sx: { position: 'absolute', inset: 0 } },
            backdrop: { sx: { position: 'absolute', inset: 0 } },
          }}
        />
      </Box>
    );
  },
};
