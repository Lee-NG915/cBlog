import { render } from '@testing-library/react';

import SearchAddress from './search-address';

describe('SearchAddress', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SearchAddress />);
    expect(baseElement).toBeTruthy();
  });
});
