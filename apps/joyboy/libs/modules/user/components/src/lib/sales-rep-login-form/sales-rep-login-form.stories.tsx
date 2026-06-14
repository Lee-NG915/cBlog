/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Meta, StoryObj } from '@storybook/react';
import { SalesRepLoginForm } from './sales-rep-login-form';

import { userEvent, within } from '@storybook/test';
import { expect } from '@storybook/test';
import { http, HttpResponse } from 'msw';
import { EcEnv } from '@castlery/config';

const meta = {
  component: SalesRepLoginForm,
  title: 'module/user/login/SalesRepLoginForm',
  parameters: {
    // https://github.com/vercel/next.js/discussions/50068
    nextjs: {
      appDirectory: true,
    },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/JDV1omKDfjjph0p409QnMj/%5BUXD%5D-2023-Q4-POS-UI-x-Refactoring?type=design&node-id=1972-27955&mode=dev',
    },
  },
} satisfies Meta<typeof SalesRepLoginForm>;

// };
export default meta;
type Story = StoryObj<typeof SalesRepLoginForm>;

export const Primary = {
  args: {},
};

export const MockedSuccess: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
  },
  render: (args) => {
    console.log(
      '🚀 ~ file: sales-rep-login-form.stories.tsx:68 ~ rest.post ~ EcEnv.NEXT_PUBLIC_API_HOST:',
      EcEnv.NEXT_PUBLIC_API_HOST
    );
    return <SalesRepLoginForm {...args} />;
  },
};

export const MockedFailure: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(`${EcEnv.NEXT_PUBLIC_API_HOST}/oauth/token`, () => {
          return HttpResponse.json({
            xx: 123,
          });
        }),
        http.post(`${EcEnv.NEXT_PUBLIC_API_HOST}/users/me`, () => {
          return HttpResponse.json({
            xx: 123,
          });
        }),
        http.get(`${EcEnv.NEXT_PUBLIC_API_HOST}/retails`, () => {
          return HttpResponse.json([
            {
              id: 1,
              slug: '123',
              name: '321',
            },
            {
              id: 2,
              slug: 'ab',
              name: 'ab',
            },
          ]);
        }),
      ],
    },
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
  },
  render: (args) => {
    const url = `${EcEnv.NEXT_PUBLIC_API_HOST}/retails`;

    console.log('🚀 ~ file: sales-rep-login-form.stories.tsx:89 ~ url:', url);
    return <SalesRepLoginForm {...args} />;
  },
};

export const FilledForm: Story = {
  // parameters: {
  //   msw: {
  //     handlers: [
  //       rest.post(`/oauth/token`, (_req, res, ctx) => {
  //         return res(
  //           ctx.json({
  //             grant_type: 'refresh_token',
  //             refresh_token: '9677949c808a4fb62a59740d2f232f4245984f1cac2702bbe382f062eeda8e6f',
  //             type: 'mock',
  //           })
  //         );
  //       }),
  //     ],
  //   },
  // },
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 👇 Simulate interactions with the component
    // await userEvent.click(canvas.getByRole('combobox', { name: /Retail Store/i }), {
    //   delay: 200,
    // });
    // userEvent.selectOptions(await canvas.getByRole('listbox'), ['1', '2'], {
    //   delay: 200,
    // });

    // await userEvent.deselectOptions(await canvas.getByRole('listbox'), '5');
    await userEvent.type(canvas.getByRole('textbox', { name: /Email/i }), 'rick.gao@castlery.com');

    await userEvent.type(canvas.getByRole('textbox', { name: /Password/i }), '123312');

    // See https://storybook.js.org/docs/essentials/actions#automatically-matching-args to learn how to setup logging in the Actions panel
    await userEvent.click(canvas.getByRole('button', { name: /Submit/i }));

    // 👇 Assert DOM structure
    await expect(
      canvas.getByText('Everything is perfect. Your account is ready and we should probably get you started!')
    ).toBeInTheDocument();
  },
};
