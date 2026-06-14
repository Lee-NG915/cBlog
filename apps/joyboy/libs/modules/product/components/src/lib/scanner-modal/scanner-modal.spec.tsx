import { render } from '@testing-library/react';

import ScannerModal from './scanner-modal';

describe('ScannerModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ScannerModal />);
    expect(baseElement).toBeTruthy();
  });
});
