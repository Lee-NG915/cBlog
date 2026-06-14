import { render } from '@testing-library/react';

import AddPayments from './add-payments';

describe('AddPayments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AddPayments />);
    expect(baseElement).toBeTruthy();
  });
});
