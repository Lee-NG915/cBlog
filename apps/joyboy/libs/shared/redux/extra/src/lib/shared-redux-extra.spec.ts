import { sharedReduxExtra } from './shared-redux-extra';

describe('sharedReduxExtra', () => {
  it('should work', () => {
    expect(sharedReduxExtra()).toEqual('shared-redux-extra');
  });
});
