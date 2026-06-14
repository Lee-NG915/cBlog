import { getSortOptions } from '../sort-options.config';

// Mock EcEnv for testing
jest.mock('@castlery/config', () => ({
  EcEnv: {
    NEXT_PUBLIC_CHANNEL: 'WEB',
    NEXT_PUBLIC_COUNTRY: 'AU',
  },
}));

describe('Sort Options Config', () => {
  describe('getSortOptions', () => {
    it('should return WEB options for default (AU) region', () => {
      const options = getSortOptions();

      expect(options).toHaveLength(4);
      expect(options[0].label).toBe('Recommendation');
      expect(options[0].value).toBe('web_product');

      // Should include Fast Dispatch for non-SG regions
      expect(options.some((option) => option.label === 'Fast Dispatch')).toBe(true);
    });

    it('should return WEB options without Fast Dispatch for SG region', () => {
      const options = getSortOptions('WEB', 'SG');

      expect(options).toHaveLength(3);
      expect(options.some((option) => option.label === 'Fast Dispatch')).toBe(false);
      expect(options.some((option) => option.label === 'Recommendation')).toBe(true);
    });

    it('should return POS options', () => {
      const options = getSortOptions('POS', 'AU');

      expect(options).toHaveLength(3);
      expect(options[0].label).toBe('Recommendation');
      expect(options[0].value).toBe('pos_product');
      expect(options.some((option) => option.label === 'Fast Dispatch')).toBe(false);
    });

    it('should return empty array for unknown channel', () => {
      const options = getSortOptions('UNKNOWN', 'AU');

      expect(options).toEqual([]);
    });

    it('should use default configuration for unknown region', () => {
      const options = getSortOptions('WEB', 'UNKNOWN_REGION');

      expect(options).toHaveLength(4);
      expect(options.some((option) => option.label === 'Fast Dispatch')).toBe(true);
    });
  });
});
