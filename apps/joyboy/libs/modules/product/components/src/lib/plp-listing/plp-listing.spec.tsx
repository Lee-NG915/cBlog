import { render } from '@testing-library/react';

import PlpListing from './plp-listing';

describe('PlpListing', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PlpListing />);
    expect(baseElement).toBeTruthy();
  });
});
