import { render } from '@testing-library/react';

import WebInfo from './web-info';

describe('WebPlaInfo', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebInfo />);
    expect(baseElement).toBeTruthy();
  });
});
