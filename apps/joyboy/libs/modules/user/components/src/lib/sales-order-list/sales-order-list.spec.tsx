import { render } from '@testing-library/react';

import SalesOrderList from './sales-order-list';

describe('SalesOrderList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SalesOrderList />);
    expect(baseElement).toBeTruthy();
  });
});
