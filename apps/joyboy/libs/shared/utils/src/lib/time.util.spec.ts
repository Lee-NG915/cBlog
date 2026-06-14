import {
  toGetZonedTime,
  getDate,
  toFormZonedTime,
  isOutdated,
  getTimestamp,
  getMilliSecondTimestamp,
  getSecondTimestamp,
  getRangeDays,
  formatDate,
  isValidDate,
  parseDate,
  isWeekend,
  addSomeDays,
  isBeforeDate,
  isAfterDate,
  addBusinessDays,
} from './time.util';

// Mock EcEnv to control environment variables
jest.mock('@castlery/config', () => ({
  EcEnv: {
    NEXT_PUBLIC_COUNTRY: 'SG',
    NEXT_PUBLIC_TIME_ZONE: 'Asia/Singapore',
  },
}));

describe('Time Utils', () => {
  const mockDate = new Date('2024-01-15T10:00:00.000Z');
  const mockDateString = '2024-01-15T10:00:00.000Z';
  const mockTimestamp = 1705312800000;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('toGetZonedTime', () => {
    it('should convert UTC date to zoned time', () => {
      const result = toGetZonedTime(mockDate);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(mockTimestamp);
    });

    it('should handle string input', () => {
      const result = toGetZonedTime(mockDateString);
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle timestamp input', () => {
      const result = toGetZonedTime(mockTimestamp);
      expect(result).toBeInstanceOf(Date);
    });

    it('should use custom timezone', () => {
      const result = toGetZonedTime(mockDate, 'America/New_York');
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('getDate', () => {
    it('should return current date when no input provided', () => {
      const result = getDate();
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(mockTimestamp);
    });

    it('should return zoned date when input provided', () => {
      const result = getDate(mockDateString);
      expect(result).toBeInstanceOf(Date);
    });

    it('should use custom timezone', () => {
      const result = getDate(mockDateString, 'America/New_York');
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('toFormZonedTime', () => {
    it('should convert zoned time to UTC', () => {
      const result = toFormZonedTime(mockDate);
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle string input', () => {
      const result = toFormZonedTime(mockDateString);
      expect(result).toBeInstanceOf(Date);
    });

    it('should use custom timezone', () => {
      const result = toFormZonedTime(mockDate, 'America/New_York');
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('isOutdated', () => {
    const pastDate = '2024-01-01T00:00:00.000Z';
    const futureDate = '2024-12-31T23:59:59.000Z';

    it('should return false when no dates provided', () => {
      expect(isOutdated()).toBe(false);
    });

    it('should return true when start date is in past', () => {
      expect(isOutdated(pastDate)).toBe(true);
    });

    it('should return true when end date is in past', () => {
      expect(isOutdated(undefined, pastDate)).toBe(true);
    });

    it('should return false when current time is between start and end', () => {
      expect(isOutdated(pastDate, futureDate)).toBe(false);
    });

    it('should return false when both dates are in future', () => {
      expect(isOutdated(futureDate, futureDate)).toBe(false);
    });
  });

  describe('getTimestamp', () => {
    it('should return current timestamp in milliseconds', () => {
      const result = getTimestamp();
      expect(result).toBe(mockTimestamp);
      expect(typeof result).toBe('number');
    });
  });

  describe('getMilliSecondTimestamp', () => {
    it('should return timestamp in milliseconds for given date', () => {
      const result = getMilliSecondTimestamp(mockDateString);
      expect(result).toBe(mockTimestamp);
      expect(typeof result).toBe('number');
    });
  });

  describe('getSecondTimestamp', () => {
    it('should return timestamp in seconds for given date', () => {
      const result = getSecondTimestamp(mockDateString);
      expect(result).toBe(Math.floor(mockTimestamp / 1000));
      expect(typeof result).toBe('number');
    });
  });

  describe('getRangeDays', () => {
    it('should return difference in days between two dates', () => {
      const laterDate = '2024-01-20T00:00:00.000Z';
      const earlierDate = '2024-01-15T00:00:00.000Z';
      const result = getRangeDays(laterDate, earlierDate);
      expect(result).toBe(5);
    });

    it('should handle negative difference', () => {
      const laterDate = '2024-01-15T00:00:00.000Z';
      const earlierDate = '2024-01-20T00:00:00.000Z';
      const result = getRangeDays(laterDate, earlierDate);
      expect(result).toBe(-5);
    });

    it('should return 0 for same dates', () => {
      const result = getRangeDays(mockDateString, mockDateString);
      expect(result).toBe(0);
    });
  });

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const result = formatDate(mockDateString);
      expect(result).toBe('Jan 15, 2024');
    });

    it('should format date with custom format', () => {
      const result = formatDate(mockDateString, 'yyyy-MM-dd');
      expect(result).toBe('2024-01-15');
    });

    it('should return empty string for invalid date', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('');
    });

    it('should use custom timezone', () => {
      const result = formatDate(mockDateString, 'yyyy-MM-dd', 'America/New_York');
      expect(result).toBe('2024-01-15');
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid date string', () => {
      expect(isValidDate(mockDateString)).toBe(true);
    });

    it('should return true for valid Date object', () => {
      expect(isValidDate(mockDate)).toBe(true);
    });

    it('should return true for valid timestamp', () => {
      expect(isValidDate(mockTimestamp)).toBe(true);
    });

    it('should return false for invalid date string', () => {
      expect(isValidDate('invalid-date')).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isValidDate(null as any)).toBe(false);
      expect(isValidDate(undefined as any)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidDate('')).toBe(false);
    });
  });

  describe('parseDate', () => {
    it('should parse date with default format', () => {
      const result = parseDate('Jan 15, 2024');
      expect(result).toBeInstanceOf(Date);
    });

    it('should parse date with custom format', () => {
      const result = parseDate('2024-01-15', 'yyyy-MM-dd');
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('isWeekend', () => {
    it('should return true for Saturday', () => {
      const saturday = new Date('2024-01-20'); // Saturday
      expect(isWeekend(saturday)).toBe(true);
    });

    it('should return true for Sunday', () => {
      const sunday = new Date('2024-01-21'); // Sunday
      expect(isWeekend(sunday)).toBe(true);
    });

    it('should return false for weekday', () => {
      const monday = new Date('2024-01-15'); // Monday
      expect(isWeekend(monday)).toBe(false);
    });

    it('should handle string input', () => {
      expect(isWeekend('2024-01-20')).toBe(true);
    });
  });

  describe('addSomeDays', () => {
    it('should add positive number of days', () => {
      const result = addSomeDays(mockDate, 5);
      expect(result.getTime()).toBe(mockDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    });

    it('should subtract days with negative number', () => {
      const result = addSomeDays(mockDate, -5);
      expect(result.getTime()).toBe(mockDate.getTime() - 5 * 24 * 60 * 60 * 1000);
    });

    it('should handle string input', () => {
      const result = addSomeDays(mockDateString, 5);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('isBeforeDate', () => {
    it('should return true when first date is before second', () => {
      const earlier = new Date('2024-01-10');
      const later = new Date('2024-01-15');
      expect(isBeforeDate(earlier, later)).toBe(true);
    });

    it('should return false when first date is after second', () => {
      const earlier = new Date('2024-01-10');
      const later = new Date('2024-01-15');
      expect(isBeforeDate(later, earlier)).toBe(false);
    });

    it('should return false for same dates', () => {
      expect(isBeforeDate(mockDate, mockDate)).toBe(false);
    });
  });

  describe('isAfterDate', () => {
    it('should return true when first date is after second', () => {
      const earlier = new Date('2024-01-10');
      const later = new Date('2024-01-15');
      expect(isAfterDate(later, earlier)).toBe(true);
    });

    it('should return false when first date is before second', () => {
      const earlier = new Date('2024-01-10');
      const later = new Date('2024-01-15');
      expect(isAfterDate(earlier, later)).toBe(false);
    });

    it('should return false for same dates', () => {
      expect(isAfterDate(mockDate, mockDate)).toBe(false);
    });
  });

  describe('addBusinessDays', () => {
    it('should add business days skipping weekends', () => {
      const monday = new Date('2024-01-15'); // Monday
      const result = addBusinessDays(monday, 5);
      // Should skip weekends, so 5 business days = 7 calendar days
      expect(result.getTime()).toBe(monday.getTime() + 7 * 24 * 60 * 60 * 1000);
    });

    it('should handle negative business days', () => {
      const friday = new Date('2024-01-19'); // Friday
      const result = addBusinessDays(friday, -5);
      // Should skip weekends, so -5 business days = -7 calendar days
      expect(result.getTime()).toBe(friday.getTime() - 7 * 24 * 60 * 60 * 1000);
    });

    it('should handle string input', () => {
      const result = addBusinessDays('2024-01-15', 5);
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle timestamp input', () => {
      const result = addBusinessDays(mockTimestamp, 5);
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle invalid timezone gracefully', () => {
      expect(() => toGetZonedTime(mockDate, 'invalid-timezone')).not.toThrow();
    });

    it('should handle null/undefined inputs gracefully', () => {
      expect(() => getDate(null as any)).not.toThrow();
      expect(() => getDate(undefined as any)).not.toThrow();
    });

    it('should handle empty string inputs', () => {
      expect(() => getDate('')).not.toThrow();
    });

    it('should handle very large numbers', () => {
      const largeTimestamp = Number.MAX_SAFE_INTEGER;
      expect(() => getDate(largeTimestamp)).not.toThrow();
    });

    it('should handle very small numbers', () => {
      const smallTimestamp = Number.MIN_SAFE_INTEGER;
      expect(() => getDate(smallTimestamp)).not.toThrow();
    });
  });

  describe('Integration tests', () => {
    it('should work together in a typical workflow', () => {
      // Create a date
      const originalDate = getDate('2024-01-15T10:00:00.000Z');

      // Add some business days
      const futureDate = addBusinessDays(originalDate, 5);

      // Check if it's not outdated
      expect(isOutdated(originalDate, futureDate)).toBe(false);

      // Format the date
      const formatted = formatDate(futureDate);
      expect(formatted).toBeTruthy();

      // Get timestamp
      const timestamp = getMilliSecondTimestamp(futureDate.toISOString());
      expect(timestamp).toBeGreaterThan(0);
    });

    it('should handle timezone conversions correctly', () => {
      const utcDate = new Date('2024-01-15T10:00:00.000Z');

      // Convert to Singapore time
      const sgDate = toGetZonedTime(utcDate, 'Asia/Singapore');

      // Convert back to UTC
      const backToUtc = toFormZonedTime(sgDate, 'Asia/Singapore');

      // Should be the same as original
      expect(backToUtc.getTime()).toBe(utcDate.getTime());
    });
  });
});
