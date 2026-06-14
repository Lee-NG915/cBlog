import { render } from '@testing-library/react';

import InfoButton from './info-button';

describe('InfoButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<InfoButton />);
    expect(baseElement).toBeTruthy();
  });
});
