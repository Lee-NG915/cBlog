import { modalDialogClasses, cardClasses } from '@castlery/fortress';

export const successModalArgs = {
  success: false,
  showDefaultFooter: false,
  fullScreen: true,
  border: false,
  showCloseBtn: false,
  dialogSx: {
    textAlign: 'center',
    justifyContent: 'center',
    [`& .${modalDialogClasses.root}-content`]: {
      margin: 'auto',
    },

    '#modal-modal-title': {
      justifyContent: 'center',
    },
    '#modal-modal-footer > button': {
      maxWidth: 173,
    },
  },
};

export const warningModalArgs = {
  title: 'Oops!',
  desc: 'Please connect reader first!',
  showCancelBtn: false,
  confirmText: 'Got it',
  dialogSx: {
    maxWidth: 350,
    [`& .${cardClasses.root}`]: {
      gap: 0,
    },
  },
};

const modalParamsMap = {
  success: successModalArgs,
  warning: warningModalArgs,
};

export function getDefaultModalArgs(type: keyof typeof modalParamsMap) {
  return modalParamsMap[type] || {};
}
