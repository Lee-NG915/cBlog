import { render } from '@testing-library/react';

import UspVariantA from './usp-variant-a';

describe('UspVariantA', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UspVariantA />);
    expect(baseElement).toBeTruthy();
  });
});
