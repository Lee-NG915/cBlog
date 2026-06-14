import { modalDialogClasses } from '@castlery/fortress';

export const failedModalParams = {
  warning: true,
  title: 'Error',
  showCancelBtn: false,
  confirmText: 'Got it',
};

export const successModalParams = {
  success: true,
  title: 'Order Complete',
  showDefaultFooter: false,
  fullScreen: true,
  border: false,
  showCloseBtn: false,
  dialogSx: {
    textAlign: 'center',
    [`& .${modalDialogClasses.root}-content`]: {
      margin: 'auto',
    },

    '#modal-modal-title': {
      justifyContent: 'center',
    },
    '#modal-modal-footer > button': {
      width: 173,
    },
  },
};

export const termsModalParams = {
  warning: true,
  title: 'Terms and Conditions',
  subDesc: 'Please acknowledge terms & conditions before completing purchase.',
  showCancelBtn: false,
  confirmText: 'Close',
  showCloseBtn: false,
  dialogSx: {
    maxWidth: 450,
  },
};
