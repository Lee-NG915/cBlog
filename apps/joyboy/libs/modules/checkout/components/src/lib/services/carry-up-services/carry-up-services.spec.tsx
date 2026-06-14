import { render } from '@testing-library/react';

import CarryUpServices from './carry-up-services';

describe('CarryUpServices', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CarryUpServices />);
    expect(baseElement).toBeTruthy();
  });
});
