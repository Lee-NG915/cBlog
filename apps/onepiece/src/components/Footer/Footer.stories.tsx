import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from '@mui/joy';
import React from 'react';
import { FooterSubscriptionUI } from './FooterSubscriptionUI';
import Footer from './index';

const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'playground / Footer',
  component: Footer,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?type=design&node-id=2435-12277&mode=dev',
    },
  },
};
export default meta;
type Story = StoryObj;

const footerPalette = {
  color: 'var(--fortress-palette-brand-flour-10)',
  bg: 'var( --fortress-palette-brand-terracotta-500)',
  hoverBg: 'var( --fortress-palette-brand-terracotta-500)',
  activeBg: '',
  disableColor: '',
  disableBg: '',
};

export const footer = () => <Footer />;

export const Subscription = () => {
  const [data, setData] = React.useState<{
    email: string;
    status: 'initial' | 'loading' | 'failure' | 'sent';
  }>({
    email: '',
    status: 'initial',
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setData((current) => ({ ...current, status: 'loading' }));
    try {
      if (Math.random() > 0.5) {
        // Replace timeout with real backend operation
        setTimeout(() => {
          setData({ email: '', status: 'sent' });
        }, 1500);
      } else {
        throw new Error();
      }
    } catch (error) {
      setData((current) => ({ ...current, status: 'failure' }));
    }
  };

  return (
    <Stack
      sx={(theme) => ({
        bgcolor: footerPalette.bg,
      })}
      py={10}
      px={10}
      spacing={2}
    >
      <FooterSubscriptionUI
        footerPalette={footerPalette}
        handleSubmit={handleSubmit}
        data={data}
        setData={setData}
        ctaText="Submit"
        error="error"
        placeholder="Enter your email"
        formLabel="We make high-quality emails, too."
      />
      <FooterSubscriptionUI
        footerPalette={footerPalette}
        handleSubmit={handleSubmit}
        data={{
          email: 'rick.gao@castlery.com',
          status: 'failure',
        }}
        setData={setData}
        ctaText="Submit"
        error="You have already subscribed to our newsletter."
        placeholder="Enter your email"
        formLabel="We make high-quality emails, too."
      />
    </Stack>
  );
};
