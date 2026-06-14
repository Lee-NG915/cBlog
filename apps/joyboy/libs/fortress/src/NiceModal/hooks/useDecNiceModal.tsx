import React from 'react';
import BaseModal from '../components/BaseModal';
import FormModal from '../components/FormModal';

/**
 * @description Declarative modal hook
 * @returns
 */
export const useDecNiceModal = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const toggleModal = () => setOpen((pre) => !pre);

  return {
    NiceModal: BaseModal,
    NiceFormModal: FormModal,
    modalProps: { open, onClose: toggleModal },
    toggleModal,
  };
};
