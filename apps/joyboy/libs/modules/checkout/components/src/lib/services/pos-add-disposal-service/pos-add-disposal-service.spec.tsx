import { render } from '@testing-library/react';

import PosAddDisposalService from './pos-add-disposal-service';

describe('PosAddDisposalService', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosAddDisposalService />);
    expect(baseElement).toBeTruthy();
  });
});
