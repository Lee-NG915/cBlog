import { render } from '@testing-library/react';

import CalculatorKeyBoards from './calculator-key-boards';

describe('CalculatorKeyBoards', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CalculatorKeyBoards />);
    expect(baseElement).toBeTruthy();
  });
});
