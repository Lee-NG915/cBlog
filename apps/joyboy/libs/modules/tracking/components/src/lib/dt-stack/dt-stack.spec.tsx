import { render } from '@testing-library/react';

import DtStack from './dt-stack';

describe('DtStack', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DtStack />);
    expect(baseElement).toBeTruthy();
  });
});
