import { render } from '@testing-library/react';

import StripeCancelButton from './stripe-cancel-button';

describe('StripeCancelButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StripeCancelButton />);
    expect(baseElement).toBeTruthy();
  });
});
