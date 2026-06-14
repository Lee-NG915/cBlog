import { render } from '@testing-library/react';

import PosItemDeliveryTip from './pos-item-delivery-tip';

describe('PosItemDeliveryTip', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosItemDeliveryTip />);
    expect(baseElement).toBeTruthy();
  });
});
