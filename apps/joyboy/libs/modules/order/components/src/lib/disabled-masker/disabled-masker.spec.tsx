import { render } from '@testing-library/react';

import DisabledMasker from './disabled-masker';

describe('DisabledMasker', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DisabledMasker />);
    expect(baseElement).toBeTruthy();
  });
});
