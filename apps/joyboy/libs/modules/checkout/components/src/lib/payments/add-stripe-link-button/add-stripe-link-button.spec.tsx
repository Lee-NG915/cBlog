import { render } from '@testing-library/react';

import AddStripeLinkButton from './add-stripe-link-button';

describe('AddStripeLinkButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AddStripeLinkButton />);
    expect(baseElement).toBeTruthy();
  });
});
