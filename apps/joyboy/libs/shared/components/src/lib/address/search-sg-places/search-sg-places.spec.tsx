import { render } from '@testing-library/react';

import SearchSgPlaces from './search-sg-places';

describe('SearchSgPlaces', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SearchSgPlaces />);
    expect(baseElement).toBeTruthy();
  });
});
