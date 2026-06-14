/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import type { StoryObj } from '@storybook/react';
import { Button, Box, Typography, useDecNiceModal, type NiceFormModalProps, useNiceModal } from '../../index';

type Story = StoryObj<NiceFormModalProps>;

/**
 * 声明式调用Form Modal 。
 * 内置了HookForm，实现form和modal均通过静态数据配置来调用，无需处理form的交互（exclude submit） & 无需维护modal的state
 */
export const DeclarativeFormFillModal: Story = {
  args: {
    form: [
      {
        key: 'email',
        type: 'input',
        subType: 'email',
        label: 'Enter your friend’s email',
        joyProps: {
          variant: 'outlined',
        },
        appendReactNode: () => (
          <Typography level="caption1" sx={{ mt: 2 }}>
            abby.wang@castlery.com,yy20166mm@163.com
          </Typography>
        ),
      },
    ],
    validators: {
      email: {
        required: true,
        validator: 'email',
      },
    },
    asyncSubmit: async (data: Record<string, any>) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    formSxProps: {
      marginBottom: 4,
    },
    title: 'Form Fill Modal',
    desc: 'Action consequence text - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
    confirmText: 'Submit',
  },
  render: ({ ...args }) => {
    const { NiceFormModal, modalProps, toggleModal } = useDecNiceModal();
    return (
      <React.Fragment>
        <Button onClick={toggleModal}>Click & Open Form-fill Modal (声明式调用 FormModal)</Button>
        <NiceFormModal {...Object.assign(modalProps, args)} />
      </React.Fragment>
    );
  },
};

export const ImperativeFormFillModal: Story = {
  args: {
    form: [
      {
        key: 'email',
        type: 'input',
        subType: 'email',
        // label: 'Enter your friend’s email',
        placeholder: 'Enter address here',
        joyProps: {
          variant: 'outlined',
        },
      },
    ],
    validators: {
      email: {
        required: true,
        validator: 'email',
      },
    },
    asyncSubmit: async (data: Record<string, any>) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    formSxProps: {
      marginBottom: 4,
      mt: 2,
    },
    title: 'Do you lorem ipsum? Do you lorem ipsum?',
    desc: 'Action consequence text - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
    subDesc:
      'Disclaimer text - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  render: (args) => {
    const [modal, contextHolder] = useNiceModal();
    const handleOpen = () => modal.formFill(args);
    React.useEffect(() => {
      handleOpen();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Box sx={{ m: 10, border: '1px solid black', p: 4, textAlign: 'center', minHeight: 600 }}>
        <Typography>Description For Developer: 命令式调用 FormModal</Typography>
        <br />
        <Button onClick={handleOpen}>Click To Open Form-fill Modal </Button>
        {contextHolder}
      </Box>
    );
  },
};
