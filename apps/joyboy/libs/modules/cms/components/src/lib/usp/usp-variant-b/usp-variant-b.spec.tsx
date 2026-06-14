import { render } from '@testing-library/react';

import UspVariantB from './usp-variant-b';

describe('UspVariantB', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UspVariantB />);
    expect(baseElement).toBeTruthy();
  });
});
