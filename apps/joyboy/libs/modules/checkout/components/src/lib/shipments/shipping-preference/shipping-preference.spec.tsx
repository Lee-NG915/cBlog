import { render } from '@testing-library/react';

import ShippingPreference from './shipping-preference';

describe('ShippingPreference', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ShippingPreference />);
    expect(baseElement).toBeTruthy();
  });
});
