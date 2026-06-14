import { render } from '@testing-library/react';

import DeliveryCalendar from './delivery-calendar';

describe('DeliveryCalendar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeliveryCalendar />);
    expect(baseElement).toBeTruthy();
  });
});
