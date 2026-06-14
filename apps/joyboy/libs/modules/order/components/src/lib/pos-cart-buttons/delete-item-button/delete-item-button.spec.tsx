import { render } from '@testing-library/react';

import DeleteItemButton from './delete-item-button';

describe('DeleteItemButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeleteItemButton />);
    expect(baseElement).toBeTruthy();
  });
});
