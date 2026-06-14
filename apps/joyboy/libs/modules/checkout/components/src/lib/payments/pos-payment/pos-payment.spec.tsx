import { render } from '@testing-library/react';

import PosPayment from './pos-payment';

describe('PosPayment', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosPayment />);
    expect(baseElement).toBeTruthy();
  });
});
