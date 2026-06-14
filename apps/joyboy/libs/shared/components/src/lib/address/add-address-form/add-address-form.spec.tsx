import { render } from '@testing-library/react';

import { AddAddressForm } from './add-address-form';

describe('AddAddressForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AddAddressForm />);
    expect(baseElement).toBeTruthy();
  });
});
