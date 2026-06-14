import { render } from '@testing-library/react';

import CreditsItem from './credits-item';

describe('CreditsItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CreditsItem />);
    expect(baseElement).toBeTruthy();
  });
});
