export interface RealtimeFilters {
  /**
   * Filter rules of Recommendation:
   * https://dy.dev/docs/return-real-time-filter-data
   * https://support.dynamicyield.com/hc/en-us/articles/4414496292497-Return-Recommendations-Real-time-Filter-Data#return-recommendations-real-time-filter-data-0-0
   */
  [campaignName: string]: {
    realtimeRules: Array<{
      id?: number /**Client-side API only. The unique ID number for every rule. This ID is used in the API response (if 2 rules have the same ID, the second rule is dropped). */;
      type: 'include' | 'exclude';
      slots: number[]; //int
      query: {
        /** conditions is 'and' */
        conditions: Array<{
          field: string /** Field within the returned results to apply the query for. */;
          /** A list of arguments for a query condition. */
          /** arguments is 'or' */
          arguments: Array<{
            action: 'IS' | 'IS_NOT' | 'CONTAINS' | 'EQ' | 'GT' | 'GTE' | 'LT' | 'LTE';
            value: string;
          }>;
        }>;
      };
    }>;
  };
}
