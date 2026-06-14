import { render } from '@testing-library/react';

import GlobalReview from './global-review';

describe('GlobalReview', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GlobalReview />);
    expect(baseElement).toBeTruthy();
  });
});
