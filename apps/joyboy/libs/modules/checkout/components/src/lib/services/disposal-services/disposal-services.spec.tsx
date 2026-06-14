import { render } from '@testing-library/react';

import DisposalServices from './disposal-services';

describe('DisposalServices', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DisposalServices />);
    expect(baseElement).toBeTruthy();
  });
});
