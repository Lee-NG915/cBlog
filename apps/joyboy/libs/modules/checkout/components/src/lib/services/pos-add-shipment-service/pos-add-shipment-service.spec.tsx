import { render } from '@testing-library/react';

import PosAddShipmentService from './pos-add-shipment-service';

describe('PosAddShipmentService', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosAddShipmentService />);
    expect(baseElement).toBeTruthy();
  });
});
