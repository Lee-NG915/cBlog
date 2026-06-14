import { render } from '@testing-library/react';

import SearchGooglePlaces from './search-google-places';

describe('SearchGooglePlaces', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SearchGooglePlaces />);
    expect(baseElement).toBeTruthy();
  });
});
