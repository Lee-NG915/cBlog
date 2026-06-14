import { render } from '@testing-library/react';

import ErrorBoundary from './errorBoundary';

describe('ErrorBoundary', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ErrorBoundary />);
    expect(baseElement).toBeTruthy();
  });
});
