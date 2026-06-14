import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';

import { AccountLogin, Favorite, Account } from '../Icons';
import { Stack, useTheme, Typography } from '@mui/joy';
import { IconButton, IconButtonProps } from '.';
const meta: Meta<IconButtonProps> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Components/Iconbutton',
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?node-id=2142-5811&m=dev',
    },
  },
  component: IconButton,
} as Meta<IconButtonProps>;

export default meta;
type Story = StoryObj<IconButtonProps>;

export const Primary: Story = {
  args: {
    children: <Favorite />,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    // 查找并点击按钮
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  },
  render: (args) => {
    return <IconButton {...args}></IconButton>;
  },
};

export const variants = () => (
  <>
    {(['primary', 'secondary', 'tertiary', 'image'] as const).map((variant) => (
      <Stack spacing={1} direction="row" sx={{ mt: 1 }}>
        <IconButton variant={variant}>
          <Favorite />
        </IconButton>
        <IconButton variant={variant} loading>
          <Favorite />
        </IconButton>
        <IconButton variant={variant} disabled>
          <Favorite />
        </IconButton>
      </Stack>
    ))}
  </>
);

export const colors = () => (
  <>
    {(['primary', 'neutral', 'success', 'danger', 'warning'] as const).map((color) => (
      <Stack spacing={1} direction="row" sx={{ mt: 1 }}>
        <IconButton variant="plain" color={color}>
          <Favorite />
        </IconButton>
        <IconButton variant="outlined" color={color}>
          <Favorite />
        </IconButton>
        <IconButton variant="solid" color={color}>
          <Favorite />
        </IconButton>
        <IconButton variant="soft" color={color}>
          <Favorite />
        </IconButton>
      </Stack>
    ))}
  </>
);
export const fontSizes: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const theme = useTheme();
    const fontSizeType = ['default', ...Object.keys(theme.fontSize)];
    return (
      <Stack sx={(theme) => ({})} width={120} spacing={2}>
        {fontSizeType.map((fontSize) => {
          return (
            <Stack
              direction={'row'}
              justifyContent={'space-around'}
              alignItems={'center'}
              sx={{
                width: '10vw',
              }}
            >
              {fontSize === fontSizeType[0] ? (
                <>
                  <Typography>{fontSize}</Typography>
                  <Favorite />
                </>
              ) : (
                <>
                  <Typography>{fontSize}</Typography>
                  <Favorite fontSize={fontSize as any} sx={{ '--fortress-icon-width': 'width' }} />
                </>
              )}
            </Stack>
          );
        })}
      </Stack>
    );
  },
};

export const FavoriteButton = () => {
  return (
    <Stack spacing={1}>
      <Stack spacing={1} direction="row">
        <IconButton variant="primary">
          <Favorite />
        </IconButton>
        <IconButton variant="primary" disabled>
          <Favorite />
        </IconButton>
        <IconButton variant="primary" loading>
          <Favorite />
        </IconButton>
      </Stack>
      <Stack spacing={1} direction="row">
        <IconButton variant="secondary">
          <Favorite />
        </IconButton>
        <IconButton variant="secondary" disabled>
          <Favorite />
        </IconButton>
        <IconButton variant="secondary" loading>
          <Favorite />
        </IconButton>
      </Stack>
      <Stack spacing={1} direction="row">
        <IconButton variant="tertiary">
          <Favorite />
        </IconButton>
        <IconButton variant="tertiary" disabled>
          <Favorite />
        </IconButton>
        <IconButton variant="tertiary" loading>
          <Favorite />
        </IconButton>
      </Stack>
      {/* <Stack spacing={1} direction="row" sx={{ mt: 1 }}>
        <IconButton disabled>
          <Favorite />
        </IconButton>
        <IconButton variant="plain" disabled>
          <Favorite />
        </IconButton>
        <IconButton variant="outlined" disabled>
          <Favorite />
        </IconButton>
        <IconButton variant="solid" disabled>
          <Favorite />
        </IconButton>
        <IconButton variant="soft" disabled>
          <Favorite />
        </IconButton>
      </Stack> */}
    </Stack>
  );
};

export const LoginIconButton = () => (
  <>
    <Stack spacing={1} direction="row">
      <IconButton aria-label="Favorite" variant="plain">
        <AccountLogin />
      </IconButton>
      <IconButton aria-label="Favorite" variant="plain">
        <Account />
      </IconButton>
    </Stack>
    <Stack spacing={1} direction="row">
      <IconButton aria-label="Favorite" variant="plain" disabled>
        <AccountLogin />
      </IconButton>
      <IconButton aria-label="Favorite" variant="plain" disabled>
        <Account />
      </IconButton>
    </Stack>
  </>
);
