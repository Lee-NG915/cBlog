import { render } from '@testing-library/react';

import ComfortRatingLine from './comfort-rating-line';

describe('ComfortRatingLine', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ComfortRatingLine />);
    expect(baseElement).toBeTruthy();
  });
});
