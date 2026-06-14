import { render } from '@testing-library/react';

import DyRecommendationWidget from './dy-recommendation-widget';

describe('DyRecommendationWidget', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DyRecommendationWidget />);
    expect(baseElement).toBeTruthy();
  });
});
