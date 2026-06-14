import { render } from '@testing-library/react';

import WebHead from './web-head.tsx';

describe('WebPlaHeadTsx', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebHead />);
    expect(baseElement).toBeTruthy();
  });
});
