import { render } from '@testing-library/react';

import AddStripeMethodButton from './add-stripe-method-button';

describe('AddStripeMethodButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AddStripeMethodButton />);
    expect(baseElement).toBeTruthy();
  });
});
