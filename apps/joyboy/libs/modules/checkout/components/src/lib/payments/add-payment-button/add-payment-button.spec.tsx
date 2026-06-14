import { render } from '@testing-library/react';

import AddPaymentButton from './add-payment-button';

describe('AddPaymentButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AddPaymentButton />);
    expect(baseElement).toBeTruthy();
  });
});
