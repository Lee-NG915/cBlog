import { render } from '@testing-library/react';

import PosShipments from './pos-shipments';

describe('PosShipments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosShipments />);
    expect(baseElement).toBeTruthy();
  });
});
