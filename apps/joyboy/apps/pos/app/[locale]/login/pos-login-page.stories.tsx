import type { Meta, StoryObj } from '@storybook/react';

import { EcEnv } from '@castlery/config';
import PosLoginPage from './page';

const meta = {
  component: PosLoginPage,
  title: 'Pages/POS/PosLoginPage',
  parameters: {
    // https://github.com/vercel/next.js/discussions/50068
    nextjs: {
      appDirectory: true,
    },
    viewport: {
      defaultViewport: 'ipad11p',
      defaultOrientation: 'landscape',
    },
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=1972-27955&mode=dev',
    },
  },
} satisfies Meta<typeof PosLoginPage>;

export default meta;
type Story = StoryObj<typeof PosLoginPage>;

export const Primary = {
  args: {},
};

export const MockedSuccess: Story = {
  play: async ({ canvasElement }) => {},
  render: (args) => {
    console.log(
      '🚀 ~ file: sales-rep-login-form.stories.tsx:68 ~ rest.post ~ EcEnv.NEXT_PUBLIC_API_HOST:',
      EcEnv.NEXT_PUBLIC_API_HOST
    );
    return <PosLoginPage />;
  },
};
