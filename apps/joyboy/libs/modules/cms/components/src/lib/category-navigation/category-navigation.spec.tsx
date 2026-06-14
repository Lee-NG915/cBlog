import { render } from '@testing-library/react';

import CategoryNavigation from './category-navigation';

describe('CategoryNavigation', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CategoryNavigation />);
    expect(baseElement).toBeTruthy();
  });
});
