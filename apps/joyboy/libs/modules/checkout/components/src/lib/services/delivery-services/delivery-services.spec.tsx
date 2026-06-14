import { render } from '@testing-library/react';

import DeliveryServices from './delivery-services';

describe('DeliveryServices', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeliveryServices />);
    expect(baseElement).toBeTruthy();
  });
});
