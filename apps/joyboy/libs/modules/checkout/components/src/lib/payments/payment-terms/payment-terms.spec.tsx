import { render } from '@testing-library/react';

import PaymentTerms from './payment-terms';

describe('PaymentTerms', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PaymentTerms />);
    expect(baseElement).toBeTruthy();
  });
});
