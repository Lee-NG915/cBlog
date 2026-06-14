import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { Box } from 'fortress';
import React from 'react';

const globalStyles = css`
  /* 覆盖 .sb-show-main.sb-main-padded 的样式 */
  .sb-show-main.sb-main-padded {
    padding: 0;
  }
`;

const GlobalStyleDecorator = (Story) => {
  return (
    <>
      <Global styles={globalStyles} />
      <Story />
    </>
  );
};

export const decorators = [GlobalStyleDecorator];
