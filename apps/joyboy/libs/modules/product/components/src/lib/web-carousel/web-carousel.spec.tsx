import { render } from '@testing-library/react';

import WebCarousel from './web-carousel';

describe('WebCarousel', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebCarousel />);
    expect(baseElement).toBeTruthy();
  });
});
