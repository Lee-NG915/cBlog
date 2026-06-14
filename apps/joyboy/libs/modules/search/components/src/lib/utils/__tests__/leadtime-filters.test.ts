import { generateLeadtimeFilters, shouldShowLeadtimeFilters, SalePageData } from '../leadtime-filters';

// Mock the dependencies
jest.mock('@castlery/modules-cms-services', () => ({
  daysToDate: jest.fn((date: string) => {
    // Mock implementation: return number of days from now
    // For testing, let's say "2024-12-31" returns 16 days
    if (date === '2024-12-31') return 16;
    if (date === '2024-11-30') return 0; // Past date
    return 5; // Default
  }),
}));

describe('leadtime-filters', () => {
  // 测试数据模拟了从 /api/sales 接口获取的销售页面数据
  // 数据源层已经过滤了过期页面，这里只包含活动的 sale pages
  const mockSalePages: SalePageData[] = [
    {
      query_deliver_before: [
        {
          deadline: '2024-12-31',
          filter_presentation: 'Delivery Before Deepavali',
        },
      ],
    },
    {
      query_deliver_before: [
        {
          deadline: '2024-12-25',
          filter_presentation: 'Delivery Before Christmas',
        },
      ],
    },
    {
      // Sale page without query_deliver_before
    },
  ];

  describe('generateLeadtimeFilters', () => {
    it('should generate leadtime filters from sale pages with delivery deadlines', () => {
      const result = generateLeadtimeFilters(mockSalePages);

      expect(result).toHaveLength(2); // Only pages with delivery deadlines
      expect(result).toEqual([
        {
          label: 'Delivery Before Deepavali',
          end: 16,
        },
        {
          label: 'Delivery Before Christmas',
          end: 5,
        },
      ]);
    });

    it('should handle empty sale pages array', () => {
      const result = generateLeadtimeFilters([]);
      expect(result).toEqual([]);
    });

    it('should handle null/undefined sale pages', () => {
      const result = generateLeadtimeFilters(null as any);
      expect(result).toEqual([]);
    });

    it('should filter out sale pages without filter_presentation', () => {
      const pagesWithoutPresentation: SalePageData[] = [
        {
          query_deliver_before: [
            {
              deadline: '2024-12-31',
              filter_presentation: '', // Empty filter_presentation
            },
          ],
        },
      ];

      const result = generateLeadtimeFilters(pagesWithoutPresentation);
      expect(result).toEqual([]);
    });

    it('should filter out invalid leadtime filters with end <= 0', () => {
      const invalidPages: SalePageData[] = [
        {
          query_deliver_before: [
            {
              deadline: '2024-11-30', // This will return 0 days (past date)
              filter_presentation: 'Past Deadline',
            },
          ],
        },
        {
          query_deliver_before: [
            {
              deadline: '2024-12-31', // This will return 16 days (valid)
              filter_presentation: 'Valid Deadline',
            },
          ],
        },
      ];

      const result = generateLeadtimeFilters(invalidPages);

      // Should only include the valid one
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        label: 'Valid Deadline',
        end: 16,
      });
    });

    it('should remove duplicate filters by label', () => {
      const duplicatePages: SalePageData[] = [
        {
          query_deliver_before: [
            {
              deadline: '2024-12-31',
              filter_presentation: 'Same Label',
            },
          ],
        },
        {
          query_deliver_before: [
            {
              deadline: '2024-12-25',
              filter_presentation: 'Same Label', // Duplicate label
            },
          ],
        },
      ];

      const result = generateLeadtimeFilters(duplicatePages);
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Same Label');
    });
  });

  describe('shouldShowLeadtimeFilters', () => {
    it('should return true when filters are available', () => {
      const filters = [{ label: 'Test Filter', end: 10 }];
      expect(shouldShowLeadtimeFilters(filters)).toBe(true);
    });

    it('should return false when no filters are available', () => {
      expect(shouldShowLeadtimeFilters([])).toBe(false);
    });
  });
});
