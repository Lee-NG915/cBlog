import { convertDeadlineToLeadTimeFilter } from '../deliver-before-filters';

import { daysToDate } from '@castlery/modules-cms-services';

// Mock daysToDate function
jest.mock('@castlery/modules-cms-services', () => ({
  daysToDate: jest.fn(),
}));

// Mock logger
jest.mock('@castlery/observability/client', () => ({
  logger: {
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockDaysToDate = daysToDate as jest.MockedFunction<typeof daysToDate>;

describe('deliver-before-filters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('convertDeadlineToLeadTimeFilter', () => {
    it('should convert valid deadline to lead_time numeric filter', () => {
      mockDaysToDate.mockReturnValueOnce(6);

      const result = convertDeadlineToLeadTimeFilter('2025-09-30 00:00');

      expect(result).toEqual(['lead_time<=6']);
      expect(mockDaysToDate).toHaveBeenCalledTimes(1);
      expect(mockDaysToDate).toHaveBeenCalledWith('2025-09-30 00:00');
    });

    it('should return empty array for invalid deadline with end <= 0', () => {
      mockDaysToDate.mockReturnValueOnce(0);

      const result = convertDeadlineToLeadTimeFilter('2023-01-01 00:00');

      expect(result).toEqual([]);
    });

    it('should return empty array for null input', () => {
      const result = convertDeadlineToLeadTimeFilter(null);
      expect(result).toEqual([]);
      expect(mockDaysToDate).not.toHaveBeenCalled();
    });

    it('should return empty array for undefined input', () => {
      const result = convertDeadlineToLeadTimeFilter(undefined);
      expect(result).toEqual([]);
      expect(mockDaysToDate).not.toHaveBeenCalled();
    });

    it('should return empty array for empty string', () => {
      const result = convertDeadlineToLeadTimeFilter('');
      expect(result).toEqual([]);
      expect(mockDaysToDate).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      mockDaysToDate.mockImplementationOnce(() => {
        throw new Error('Invalid date format');
      });

      const result = convertDeadlineToLeadTimeFilter('invalid-date');

      expect(result).toEqual([]);
    });
  });
});
