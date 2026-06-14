import { render } from '@testing-library/react';

import PosAddCarryUpService from './pos-add-carry-up-service';

describe('PosAddCarryUpService', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PosAddCarryUpService />);
    expect(baseElement).toBeTruthy();
  });
});
