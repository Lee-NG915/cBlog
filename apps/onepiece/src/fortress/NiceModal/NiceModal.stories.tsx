// NiceModal.stories.ts|tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import NiceModal from './components/BaseModal';
import type { ModalFuncProps } from './components/HookModal';
import { Button } from 'fortress';
import { useNiceModal } from 'fortress';
import NestedModals from './components/NestedModal';
import {
  BaseModalStory,
  BaseModalStoryActions,
  BaseModalStorySuccess,
  BaseModalStoryInformation,
  BaseModalStoryWarning,
  BaseModalStoryDanger,
} from './demos/BaseModalStory';
import { DeclarativeFormFillModal, ImperativeFormFillModal } from './demos/FormModalStory';
import { DeclarativeModal, ImperativeModal } from './demos/CommonModalStory';

const meta: Meta<ModalFuncProps> = {
  title: 'fortress / NiceModal',
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
        modal.information({
          ...args,
        }),
      [modal]
    );
    React.useEffect(() => {
      openModal();
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
    return (
      <React.Fragment>
        <NestedModals />
      </React.Fragment>
    );
  },
};
