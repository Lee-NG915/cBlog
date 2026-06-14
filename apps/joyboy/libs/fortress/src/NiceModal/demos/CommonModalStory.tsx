/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import type { StoryObj } from '@storybook/react';
import { Button, Box, Typography, useNiceModal, type ImpModalProps, useDecNiceModal } from '../../index';

type Story = StoryObj<ImpModalProps>;

/**
 * 命令式调用 Modal 。
 * 更加优雅调用，quick & High degree of customization.
 * Demo: Update Password
 * step 1: Open confirmation Modal，confirm and send email to change password.
 * step 2: Success or failure, the corresponding pop-up window will be displayed.
 */
export const ImperativeModal: Story = {
  args: {
    title: 'Confirm to change your password?',
    desc: 'After clicking Confirm, we will send an email to your email. Please follow the instructions in the email to change your password.',
    subDesc: <Typography sx={{ color: 'orange' }}>The email is valid within 30 minutes</Typography>,
    confirmText: 'Confirm',
    onConfirm: () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ status: 0, detail: 'Email sent successfully ！' });
          //   resolve({ status: 12345, detail: 'Failed to send email' });
        }, 500);
      }),
  },
  render: (args) => {
    const [modal, contextHolder] = useNiceModal();

    const handleOpen = () => {
      const { reset, then } = modal.info({ ...args });
      then((result) => {
        if (result) {
          reset({
            title: result?.detail,
            ...(result.status
              ? {
                  danger: true,
                  desc: <Typography sx={{ color: 'red' }}>Please try it again later.</Typography>,
                }
              : {
                  success: true,
                  desc: <Typography sx={{ color: 'green' }}>Please go to your email to operate ~</Typography>,
                }),
            showCancelBtn: false,
            confirmText: 'Got It',
          });
        }
      });
    };
    return (
      <React.Fragment>
        {/* =================== Demo‘s Instruction =================== */}
        <Box sx={{ m: 10, border: '1px solid black', p: 4, textAlign: 'center' }}>
          <Typography level="h2" sx={{ mb: 2 }}>
            Demo: Common Modal
          </Typography>
          <Typography level="h3">Business Scenario: 【Update Password】</Typography>
          <Typography level="caption1">
            <b>step 1:</b> Open confirmation Modal，confirm and send email to change password.
          </Typography>
          <Typography level="caption1">
            <b>step 2:</b> Success or failure, the corresponding pop-up window will be displayed.
          </Typography>
          <br />
          <Button sx={{ mt: 2 }} onClick={handleOpen}>
            Open Update-Password Modal
          </Button>
        </Box>

        {/* =================== Modal Start =================== */}
        {contextHolder}
        {/* =================== Modal End =================== */}
      </React.Fragment>
    );
  },
};

/**
 * 声明式调用 Modal 。
 * 基于hook调用，无需单独维护open状态和toggle interaction，这会让调用变得简单
 */
export const DeclarativeModal: Story = {
  args: {
    title: 'Do you want to lorem ipsum?',
    success: true,
    desc: 'Action consequence text - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
    onConfirm: () => {
      console.log('confirm');
    },
  },
  render: (args) => {
    const { NiceModal, modalProps, toggleModal } = useDecNiceModal();
    React.useEffect(() => {
      toggleModal();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
      <React.Fragment>
        <Button variant="outlined" color="neutral" onClick={toggleModal}>
          Open Confirmation Modal
        </Button>
        <NiceModal {...modalProps} {...args} />
      </React.Fragment>
    );
  },
};
