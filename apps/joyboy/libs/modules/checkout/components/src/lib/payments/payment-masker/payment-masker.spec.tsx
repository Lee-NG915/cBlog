import { render } from '@testing-library/react';

import PaymentMasker from './payment-masker';

describe('PaymentMasker', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PaymentMasker />);
    expect(baseElement).toBeTruthy();
  });
});
