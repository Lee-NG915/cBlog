import { render } from '@testing-library/react';

import Scanner from './scanner';

describe('ScannerModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Scanner />);
    expect(baseElement).toBeTruthy();
  });
});
