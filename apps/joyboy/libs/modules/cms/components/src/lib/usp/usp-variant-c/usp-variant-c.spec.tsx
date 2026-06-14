import { render } from '@testing-library/react';

import UspVariantC from './usp-variant-c';

describe('UspVariantC', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UspVariantC />);
    expect(baseElement).toBeTruthy();
  });
});
