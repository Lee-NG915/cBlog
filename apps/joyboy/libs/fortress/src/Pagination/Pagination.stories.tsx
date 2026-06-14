import type { Meta } from '@storybook/react';
import Pagination from './Pagination';
import { PaginationProps } from './Pagination';
// import { within, expect } from '@storybook/test';

import * as React from 'react';

const meta: Meta<PaginationProps> = {
  component: Pagination,
  title: 'Components/Pagination',
  argTypes: {
    onChange: { action: 'onChange executed!' },
  },
};
export default meta;

export const Default = () => {
  const page = 1;
  const onChange = (e: any, pageNumber: any) => {
    setPageParams({
      ...pageParams,
      page: pageNumber,
    });
  };
  const [pageParams, setPageParams] = React.useState({
    page: page,
    totalPage: 10,
  });
  return <Pagination count={pageParams.totalPage} page={pageParams.page} onChange={onChange} />;
};

// Primary.play = async ({ canvasElement }) => {
//   const canvas = within(canvasElement);
//   const pagination = canvas.getByText('1');
//   expect(pagination).toBeInTheDocument();
//   const currentPage = canvas.getByText('1');
//   expect(currentPage).toBeInTheDocument();
//   const totalPages = canvas.getByText('10');
//   expect(totalPages).toBeInTheDocument();
// };
