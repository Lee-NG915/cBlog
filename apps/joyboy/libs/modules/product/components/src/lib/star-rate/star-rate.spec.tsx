import { render } from '@testing-library/react';

import StarRate from './star-rate';

describe('StarRate', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StarRate />);
    expect(baseElement).toBeTruthy();
  });
});
