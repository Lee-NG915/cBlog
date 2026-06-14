/* eslint-disable @typescript-eslint/no-unused-vars */
import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { Box } from '..';
import React from 'react';

const globalStyles = css`
  /* 覆盖 .sb-show-main.sb-main-padded 的样式 */
  .sb-show-main.sb-main-padded {
    padding: 0;
  }
`;

const GlobalStyleDecorator = (Story: React.FC) => {
  return (
    <>
      <Global styles={globalStyles} />
      <Story />
    </>
  );
};

export const decorators = [GlobalStyleDecorator];
