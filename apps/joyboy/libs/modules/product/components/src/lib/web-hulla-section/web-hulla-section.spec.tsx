import { render } from '@testing-library/react';

import WebHullaSection from './web-hulla-section';

describe('WebHullaSection', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WebHullaSection />);
    expect(baseElement).toBeTruthy();
  });
});
