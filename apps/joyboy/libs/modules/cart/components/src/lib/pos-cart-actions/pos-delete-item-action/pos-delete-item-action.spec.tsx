import { render } from '@testing-library/react';

import DeleteItemAction from './pos-delete-item-action';

describe('DeleteItemAction', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeleteItemAction />);
    expect(baseElement).toBeTruthy();
  });
});
