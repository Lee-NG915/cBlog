import type { FormData, ValidatorsData } from '@castlery/fortress/HookForm/types';
import React from 'react';
import { ResetPwdLink } from '../RestPwdLink';

export const form = (email: string): FormData => [
  {
    key: 'password',
    label: 'Old Password',
    type: 'input',
    subType: 'password',
  },
  {
    key: 'new_password',
    label: 'New Password',
    type: 'input',
    subType: 'password',
    insertReactNode: () => <ResetPwdLink email={email} />,
  },
  {
    key: 'confirm_password',
    label: 'Confirm New Password',
    type: 'input',
    subType: 'password',
  },
];
export const validators: ValidatorsData = {
  password: {
    required: true,
  },
  new_password: {
    required: true,
    validator: 'password',
  },
  confirm_password: {
    required: true,
    validator: (values: Record<string, any>) => {
      const value = values.confirm_password;
      const tar = values.new_password;
      return value !== tar ? { type: 'custom', message: 'Passwords do not match' } : null;
    },
  },
};
