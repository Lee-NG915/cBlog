import { render } from '@testing-library/react';

import LevelCubeLine from './level-cube-line';

describe('LevelCubeLine', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<LevelCubeLine />);
    expect(baseElement).toBeTruthy();
  });
});
