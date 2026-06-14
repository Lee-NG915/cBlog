import { render } from '@testing-library/react';

import PayButton from './pay-button';

describe('PayButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PayButton />);
    expect(baseElement).toBeTruthy();
  });
});
