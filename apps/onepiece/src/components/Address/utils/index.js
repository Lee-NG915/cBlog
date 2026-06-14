import React from 'react';

export const findDiffAddressByid = (oldAddresses, newAddresses) => {
  // 找newAddresses中的在oldAddresses中不存在的地址
  const oldAddressesIds = {};
  for (const address of oldAddresses) {
    oldAddressesIds[address.id] = true;
  }

  for (const address of newAddresses) {
    if (!oldAddressesIds[address.id]) {
      return address;
    }
  }

  return null;
};

/**
 * @description show modal to confirm if user want to leave the page without saving the address
 * @param {*} frame
 * @param {*} confirmCallback
 * @param {*} cancelCallbck
 */
export const unSavedAddressHandler = ({ frame, confirmCallback, cancelCallbck }) => {
  frame.openModal('confirmation', {
    title: 'Unsaved Changes',
    description: (
      <>
        You have made changes{' '}
        <span
          style={{
            fontWeight: '500',
          }}
        >
          to the shipping address
        </span>
        . Are you sure you want to cancel? Unsaved changes will be lost.
      </>
    ),
    confirmText: 'Continue Editing',
    cancelText: 'Discard Changes',
    onCancel: () => {
      cancelCallbck && cancelCallbck();
    },
    onConfirm: () => {
      confirmCallback && confirmCallback();
    },
  });
};
