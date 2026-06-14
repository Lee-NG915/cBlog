import type { Meta, StoryObj } from '@storybook/react';
import { ServiceGurantee } from './service-gurantee';

const meta: Meta<typeof ServiceGurantee> = {
  component: ServiceGurantee,
  title: 'module/shared/ServiceGurantee',
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
    // https://github.com/vercel/next.js/discussions/50068
    // nextjs: {
    //   appDirectory: true,
    // },
  },
};
export default meta;
type Story = StoryObj<typeof ServiceGurantee>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    return <ServiceGurantee />;
  },
};
