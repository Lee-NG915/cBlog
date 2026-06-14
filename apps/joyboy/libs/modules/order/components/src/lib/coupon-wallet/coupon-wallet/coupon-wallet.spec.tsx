import { render } from '@testing-library/react';

import Wallet from './wallet';

describe('Wallet', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Wallet />);
    expect(baseElement).toBeTruthy();
  });
});
