import { render } from '@testing-library/react';

import AdditionalServices from './additional-services';

describe('AdditionalServices', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AdditionalServices />);
    expect(baseElement).toBeTruthy();
  });
});
