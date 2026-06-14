// import { render } from '@testing-library/react';

import AssemblyService from './assembly-service';
console.log(window.matchMedia);
describe('AssemblyService', () => {
  it('should render successfully', () => {
    const { baseElement } = global.renderWithRedux(<AssemblyService />);
    expect(baseElement).toBeTruthy();
  });
});
