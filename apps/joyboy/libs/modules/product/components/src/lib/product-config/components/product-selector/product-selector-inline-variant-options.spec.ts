import { getOttomanDescription } from './product-selector-inline-variant-options';

describe('getOttomanDescription', () => {
  it('returns metric dimensions for dawson standard in AU', () => {
    expect(
      getOttomanDescription({
        spuGroupTitle: 'Dawson',
        optionName: 'Standard Ottoman',
        country: 'AU',
      })
    ).toBe('W114 x D93cm');
  });

  it('returns metric dimensions for dawson standard in SG', () => {
    expect(
      getOttomanDescription({
        spuGroupTitle: 'Dawson',
        optionName: 'Standard Ottoman',
        country: 'SG',
      })
    ).toBe('W114 x D93cm');
  });

  it('returns metric dimensions for dawson storage in UK', () => {
    expect(
      getOttomanDescription({
        spuGroupTitle: 'Dawson',
        optionName: 'Storage Ottoman',
        country: 'UK',
      })
    ).toBe('W114 x D93cm');
  });

  it('keeps inch dimensions for dawson standard in US', () => {
    expect(
      getOttomanDescription({
        spuGroupTitle: 'Dawson',
        optionName: 'Standard Ottoman',
        country: 'US',
      })
    ).toBe('W44.9" x D36.6"');
  });

  it('keeps inch dimensions for dawson storage in CA', () => {
    expect(
      getOttomanDescription({
        spuGroupTitle: 'Dawson',
        optionName: 'Storage Ottoman',
        country: 'CA',
      })
    ).toBe('W44.9" x D36.6"');
  });

  it('does not change ottoman dimensions for SG', () => {
    expect(
      getOttomanDescription({
        spuGroupTitle: 'Dawson',
        optionName: 'Ottoman',
        country: 'SG',
      })
    ).toBe('W44.9" x D36.6"');
  });

  it('returns undefined for unsupported SPUs', () => {
    expect(
      getOttomanDescription({
        spuGroupTitle: 'Unknown',
        optionName: 'Standard Ottoman',
        country: 'SG',
      })
    ).toBeUndefined();
  });

  it('returns undefined for unmatched option names', () => {
    expect(
      getOttomanDescription({
        spuGroupTitle: 'Dawson',
        optionName: 'Bench',
        country: 'SG',
      })
    ).toBeUndefined();
  });
});
