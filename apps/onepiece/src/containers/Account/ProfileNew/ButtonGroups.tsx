import React from 'react';
import { Button } from '@castlery/fortress/Button';
import { ButtonLayout } from './Layout';

interface ButtonGroupsProps {
  mobile: boolean;
  cancel: () => void;
  submitDisable: boolean;
}
export const ButtonGroups: React.FC<ButtonGroupsProps> = React.memo(({ mobile, cancel, submitDisable = false }) => (
  <ButtonLayout mobile={mobile}>
    <Button variant="tertiary" sx={{ ...(mobile ? {} : { width: 60 }) }} onClick={cancel}>
      Cancel
    </Button>
    <Button type="submit" loading={submitDisable} sx={{ minWidth: 120 }}>
      Save
    </Button>
  </ButtonLayout>
));
