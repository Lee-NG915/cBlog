import { render } from '@testing-library/react';

import PosShipmentItem from './pos-shipment-item';

describe('PosShipmentItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosShipmentItem />);
    expect(baseElement).toBeTruthy();
  });
});
