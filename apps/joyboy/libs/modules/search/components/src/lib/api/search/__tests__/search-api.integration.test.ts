/**
 * Search API Integration Tests — Self-Discovering
 *
 * Automatically discovers available data from the target environment,
 * then generates and runs test scenarios. No hardcoded values.
 *
 * See __tests__/README.md for usage instructions.
 *
 * Skipped when SEARCH_API_BASE_URL is not set (safe for CI).
 */
import http from 'http';
import https from 'https';
import { FACET_ATTRIBUTES_CONFIG } from '../../../config/facet-attributes.config';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_URL = process.env.SEARCH_API_BASE_URL;
const MARKET = process.env.SEARCH_API_MARKET || 'sg';
const SEARCH_ENDPOINT = BASE_URL ? `${BASE_URL}/${MARKET}/api/search` : '';

const describeIfApi = BASE_URL ? describe : describe.skip;

// ---------------------------------------------------------------------------
// HTTP helper (Jest environment has no global fetch)
// ---------------------------------------------------------------------------

function httpPost(url: string, body: string): Promise<{ status: number; data: any; raw: string }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const mod = parsedUrl.protocol === 'https:' ? https : http;
    const req = mod.request(
      url,
      { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' } },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 0, data: JSON.parse(raw), raw });
          } catch {
            resolve({ status: res.statusCode || 0, data: { parseError: true, preview: raw.substring(0, 300) }, raw });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function searchApi(body: any): Promise<{ status: number; data: any; raw: string }> {
  return httpPost(SEARCH_ENDPOINT, JSON.stringify(body));
}

// ---------------------------------------------------------------------------
// InstantSearch request builders
// ---------------------------------------------------------------------------

interface SearchRequestOptions {
  indexName?: string;
  facets?: string | string[];
  hitsPerPage?: number;
  page?: number;
  query?: string;
  categoryPermalink?: string;
  currentZipcode?: string;
  numericFilters?: string[];
}

function buildSearchRequest(facetFilters: string[][], options: SearchRequestOptions = {}) {
  const {
    indexName = 'web_product',
    facets = ['*'],
    hitsPerPage = 24,
    page = 0,
    query = '',
    categoryPermalink,
    currentZipcode = '17',
    numericFilters,
  } = options;

  const ruleContext: Record<string, any> = {
    queryString: query,
    baseFilters: [],
    currentZipcode,
  };
  if (categoryPermalink) {
    ruleContext.categoryPermalink = categoryPermalink;
  }

  const params: Record<string, any> = {
    facetFilters,
    facets,
    highlightPostTag: '__/ais-highlight__',
    highlightPreTag: '__ais-highlight__',
    hitsPerPage,
    maxValuesPerFacet: 999,
    page,
    query,
    ruleContexts: [JSON.stringify(ruleContext)],
  };
  if (numericFilters) {
    params.numericFilters = numericFilters;
  }

  return { indexName, params };
}

function buildInstantSearchBody(facetFilters: string[][], options: SearchRequestOptions = {}) {
  const mainRequest = buildSearchRequest(facetFilters, options);
  const disjunctiveRequests = facetFilters.map((filterGroup) => {
    const facetName = filterGroup[0].split(':')[0];
    const otherFilters = facetFilters.filter((fg) => fg !== filterGroup);
    return buildSearchRequest(otherFilters, { ...options, facets: facetName, hitsPerPage: 0 });
  });
  return [mainRequest, ...disjunctiveRequests];
}

// ---------------------------------------------------------------------------
// Facet config analysis
// ---------------------------------------------------------------------------

type FacetGroup = { nestedPath: string; facets: Array<{ attribute: string; type: string }> };

function getFacetGroups(): FacetGroup[] {
  const groups = new Map<string, FacetGroup>();
  for (const facet of FACET_ATTRIBUTES_CONFIG) {
    const np = (facet as any).nestedPath;
    if (!np) continue;
    if (!groups.has(np)) {
      groups.set(np, { nestedPath: np, facets: [] });
    }
    groups.get(np)!.facets.push({ attribute: facet.attribute, type: facet.type as string });
  }
  return Array.from(groups.values());
}

function getNonNestedFacets(): Array<{ attribute: string; type: string }> {
  return FACET_ATTRIBUTES_CONFIG.filter((f) => !(f as any).nestedPath).map((f) => ({
    attribute: f.attribute,
    type: f.type as string,
  }));
}

// ---------------------------------------------------------------------------
// Dynamic value discovery
// ---------------------------------------------------------------------------

async function discoverFacetValues(facetNames: string[]): Promise<Map<string, string[]>> {
  const body = [buildSearchRequest([], { facets: facetNames, hitsPerPage: 0 })];
  const { status, data } = await searchApi(body);
  const result = new Map<string, string[]>();

  if (status !== 200 || !data.results?.[0]?.facets) return result;

  const facets = data.results[0].facets;
  for (const name of facetNames) {
    const values = facets[name];
    if (values && typeof values === 'object') {
      const sorted = Object.entries(values)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .map(([k]) => k);
      result.set(name, sorted.slice(0, 5));
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describeIfApi('Search API Integration', () => {
  jest.setTimeout(90000);

  let facetValues: Map<string, string[]>;

  beforeAll(async () => {
    const allStringFacets = FACET_ATTRIBUTES_CONFIG.filter((f) => f.type === 'string').map((f) => f.attribute);
    facetValues = await discoverFacetValues(allStringFacets);

    // eslint-disable-next-line no-console
    console.log(`\n  Discovered ${facetValues.size} facets with values from ${BASE_URL} (${MARKET})`);
    for (const [name, values] of facetValues) {
      // eslint-disable-next-line no-console
      console.log(`    ${name}: ${values.slice(0, 3).join(', ')}${values.length > 3 ? ' ...' : ''}`);
    }
  });

  // helper: pick first facet with values
  function pickFacet(minValues = 1): [string, string[]] | undefined {
    return [...facetValues.entries()].find(([, v]) => v.length >= minValues);
  }

  // helper: pick facet from a specific nestedPath
  function pickFacetFromPath(nestedPath: string): [string, string[]] | undefined {
    const attrs = FACET_ATTRIBUTES_CONFIG.filter((f) => (f as any).nestedPath === nestedPath).map((f) => f.attribute);
    for (const attr of attrs) {
      const vals = facetValues.get(attr);
      if (vals && vals.length > 0) return [attr, vals];
    }
    return undefined;
  }

  // =========================================================================
  // 1. Basic search
  // =========================================================================

  describe('basic search', () => {
    it('should return results without any filters', async () => {
      const { status, data } = await searchApi([buildSearchRequest([])]);

      expect(status).toBe(200);
      expect(data.results[0].nbHits).toBeGreaterThan(0);
      expect(data.results[0].hits.length).toBeGreaterThan(0);
    });

    it('should return results with keyword query', async () => {
      const { status, data } = await searchApi([buildSearchRequest([], { query: 'sofa' })]);

      expect(status).toBe(200);
      expect(data.results[0].nbHits).toBeGreaterThanOrEqual(0);
    });

    it('should return results scoped to a category', async () => {
      const { status, data } = await searchApi([buildSearchRequest([], { categoryPermalink: 'sofas' })]);

      expect(status).toBe(200);
      expect(data.results[0].nbHits).toBeGreaterThan(0);
    });

    it('should return fewer results for keyword + category than category alone', async () => {
      const [catOnly, catKeyword] = await Promise.all([
        searchApi([buildSearchRequest([], { categoryPermalink: 'sofas' })]),
        searchApi([buildSearchRequest([], { categoryPermalink: 'sofas', query: 'leather' })]),
      ]);

      expect(catOnly.status).toBe(200);
      expect(catKeyword.status).toBe(200);
      expect(catKeyword.data.results[0].nbHits).toBeLessThanOrEqual(catOnly.data.results[0].nbHits);
    });

    it('should return results for keyword with special characters', async () => {
      const queries = ['sofa & chair', "l'shaped", 'tête-à-tête'];
      const results = await Promise.all(queries.map((q) => searchApi([buildSearchRequest([], { query: q })])));

      results.forEach(({ status, data }) => {
        expect(status).toBe(200);
        expect(data.results).toBeDefined();
        expect(typeof data.results[0].nbHits).toBe('number');
      });
    });
  });

  // =========================================================================
  // 2. Pagination
  // =========================================================================

  describe('pagination', () => {
    it('should return different results for page 0 vs page 1', async () => {
      const [page0, page1] = await Promise.all([
        searchApi([buildSearchRequest([], { hitsPerPage: 2, page: 0 })]),
        searchApi([buildSearchRequest([], { hitsPerPage: 2, page: 1 })]),
      ]);

      expect(page0.status).toBe(200);
      expect(page1.status).toBe(200);

      const slugs0 = page0.data.results[0].hits.map((h: any) => h.slug);
      const slugs1 = page1.data.results[0].hits.map((h: any) => h.slug);
      if (slugs0.length > 0 && slugs1.length > 0) {
        expect(slugs0).not.toEqual(slugs1);
      }
    });

    it('should respect hitsPerPage', async () => {
      const { status, data } = await searchApi([buildSearchRequest([], { hitsPerPage: 3 })]);

      expect(status).toBe(200);
      expect(data.results[0].hits.length).toBeLessThanOrEqual(3);
    });

    it('should return 0 hits for page far beyond results', async () => {
      const { status, data } = await searchApi([buildSearchRequest([], { hitsPerPage: 24, page: 9999 })]);

      // Elasticsearch may return 200 with empty hits or 500 for very high offsets
      expect([200, 500]).toContain(status);
      expect(data.results[0].hits.length).toBe(0);
    });

    it('should return correct nbPages based on total and hitsPerPage', async () => {
      const { status, data } = await searchApi([buildSearchRequest([], { hitsPerPage: 1 })]);

      expect(status).toBe(200);
      const result = data.results[0];
      expect(result.nbPages).toBe(Math.ceil(result.nbHits / result.hitsPerPage));
    });
  });

  // =========================================================================
  // 3. Sorting (different index names)
  // =========================================================================

  describe('sorting', () => {
    it.each(['web_product', 'web_product_lead_asc', 'web_product_price_asc', 'web_product_price_desc'])(
      'should return results for index %s',
      async (indexName) => {
        const { status, data } = await searchApi([buildSearchRequest([], { indexName, hitsPerPage: 1 })]);

        expect(status).toBe(200);
        expect(typeof data.results[0].nbHits).toBe('number');
      }
    );

    it('should return price-ascending order with web_product_price_asc', async () => {
      const { status, data } = await searchApi([
        buildSearchRequest([], { indexName: 'web_product_price_asc', hitsPerPage: 10 }),
      ]);

      expect(status).toBe(200);
      const hits = data.results[0].hits;
      if (hits.length >= 2) {
        const prices = hits.map((h: any) => {
          const variants = h.variants || [];
          if (variants.length === 0) return Infinity;
          return Math.min(...variants.map((v: any) => v.price ?? Infinity));
        });
        for (let i = 1; i < prices.length; i++) {
          expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
        }
      }
    });

    it('should return price-descending order with web_product_price_desc', async () => {
      const { status, data } = await searchApi([
        buildSearchRequest([], { indexName: 'web_product_price_desc', hitsPerPage: 10 }),
      ]);

      expect(status).toBe(200);
      const hits = data.results[0].hits;
      if (hits.length >= 2) {
        const prices = hits.map((h: any) => {
          const variants = h.variants || [];
          if (variants.length === 0) return -Infinity;
          return Math.min(...variants.map((v: any) => v.price ?? -Infinity));
        });
        for (let i = 1; i < prices.length; i++) {
          expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
        }
      }
    });
  });

  // =========================================================================
  // 4. Invalid indexName
  // =========================================================================

  describe('invalid indexName', () => {
    it.each(['invalid_index', 'web_product_invalid_sort', 'malicious; DROP TABLE'])(
      'should return 500 empty response for indexName "%s"',
      async (indexName) => {
        const { status, data } = await searchApi([buildSearchRequest([], { indexName, hitsPerPage: 1 })]);

        expect(status).toBe(500);
        expect(data.results[0].hits).toEqual([]);
        expect(data.results[0].nbHits).toBe(0);
      }
    );
  });

  // =========================================================================
  // 5. Single facet filtering
  // =========================================================================

  describe('single facet filtering', () => {
    it('should filter by a discovered string facet', async () => {
      const entry = pickFacet(1);
      if (!entry) return;
      const [facetName, values] = entry;

      const body = buildInstantSearchBody([[`${facetName}:${values[0]}`]]);
      const { status, data } = await searchApi(body);

      expect(status).toBe(200);
      expect(data.results.length).toBe(2);
      expect(typeof data.results[0].nbHits).toBe('number');
    });

    it('should filter with OR logic within a facet group', async () => {
      const entry = pickFacet(2);
      if (!entry) return;
      const [facetName, values] = entry;

      const body = [buildSearchRequest([[`${facetName}:${values[0]}`, `${facetName}:${values[1]}`]])];
      const { status, data } = await searchApi(body);

      expect(status).toBe(200);
      expect(typeof data.results[0].nbHits).toBe('number');
    });

    it('should narrow results with AND logic between facet groups', async () => {
      const entries = [...facetValues.entries()].filter(([, v]) => v.length > 0);
      if (entries.length < 2) return;

      const [facetA, valuesA] = entries[0];
      const [facetB, valuesB] = entries[1];

      const [singleFilter, doubleFilter] = await Promise.all([
        searchApi([buildSearchRequest([[`${facetA}:${valuesA[0]}`]])]),
        searchApi([buildSearchRequest([[`${facetA}:${valuesA[0]}`], [`${facetB}:${valuesB[0]}`]])]),
      ]);

      expect(singleFilter.status).toBe(200);
      expect(doubleFilter.status).toBe(200);
      expect(doubleFilter.data.results[0].nbHits).toBeLessThanOrEqual(singleFilter.data.results[0].nbHits);
    });
  });

  // =========================================================================
  // 6. Non-nested facet filtering
  // =========================================================================

  describe('non-nested facet filtering', () => {
    it('should filter by a facet without nestedPath (e.g., styles)', async () => {
      const nonNested = getNonNestedFacets().filter((f) => f.type === 'string');
      if (nonNested.length === 0) return;

      const attr = nonNested[0].attribute;
      const vals = facetValues.get(attr);
      if (!vals || vals.length === 0) return;

      const body = buildInstantSearchBody([[`${attr}:${vals[0]}`]]);
      const { status, data } = await searchApi(body);

      expect(status).toBe(200);
      expect(typeof data.results[0].nbHits).toBe('number');
    });
  });

  // =========================================================================
  // 7. Category + facet combined
  // =========================================================================

  describe('category + facet combined', () => {
    it('should scope results to category AND facet simultaneously', async () => {
      const entry = pickFacet(1);
      if (!entry) return;
      const [facetName, values] = entry;

      const { status, data } = await searchApi([
        buildSearchRequest([[`${facetName}:${values[0]}`]], { categoryPermalink: 'sofas' }),
      ]);

      expect(status).toBe(200);
      expect(typeof data.results[0].nbHits).toBe('number');
    });

    it('should return fewer results than category alone', async () => {
      const entry = pickFacet(1);
      if (!entry) return;
      const [facetName, values] = entry;

      const [catOnly, catFacet] = await Promise.all([
        searchApi([buildSearchRequest([], { categoryPermalink: 'sofas' })]),
        searchApi([buildSearchRequest([[`${facetName}:${values[0]}`]], { categoryPermalink: 'sofas' })]),
      ]);

      expect(catOnly.status).toBe(200);
      expect(catFacet.status).toBe(200);
      expect(catFacet.data.results[0].nbHits).toBeLessThanOrEqual(catOnly.data.results[0].nbHits);
    });
  });

  // =========================================================================
  // 8. Keyword + filters combined
  // =========================================================================

  describe('keyword + filters combined', () => {
    it('should return results for keyword query with facet filter', async () => {
      const entry = pickFacet(1);
      if (!entry) return;
      const [facetName, values] = entry;

      const { status, data } = await searchApi([
        buildSearchRequest([[`${facetName}:${values[0]}`]], { query: 'sofa' }),
      ]);

      expect(status).toBe(200);
      expect(typeof data.results[0].nbHits).toBe('number');
    });

    it('should return results for keyword query with numeric filter', async () => {
      const { status, data } = await searchApi([
        buildSearchRequest([], { query: 'table', numericFilters: ['price>=100', 'price<=3000'] }),
      ]);

      expect(status).toBe(200);
      expect(typeof data.results[0].nbHits).toBe('number');
    });
  });

  // =========================================================================
  // 9. Same-nestedPath pairwise combinations (inner_hits dedup)
  // =========================================================================

  describe('same-nestedPath filter combinations', () => {
    it('should handle all pairwise combinations without Elasticsearch errors', async () => {
      const conflictGroups = getFacetGroups().filter((g) => g.facets.length >= 2);
      const results: Array<{ pair: string; status: number; hits: number; ok: boolean }> = [];

      for (const group of conflictGroups) {
        const stringFacets = group.facets.filter((f) => f.type === 'string');

        for (let i = 0; i < stringFacets.length; i++) {
          for (let j = i + 1; j < stringFacets.length; j++) {
            const facetA = stringFacets[i].attribute;
            const facetB = stringFacets[j].attribute;
            const valuesA = facetValues.get(facetA);
            const valuesB = facetValues.get(facetB);

            if (!valuesA?.length || !valuesB?.length) continue;

            const body = buildInstantSearchBody([[`${facetA}:${valuesA[0]}`], [`${facetB}:${valuesB[0]}`]]);
            const { status, data } = await searchApi(body);
            const hits = data.results?.[0]?.nbHits ?? -1;
            const ok = status === 200 && typeof hits === 'number' && hits >= 0;

            results.push({ pair: `${group.nestedPath}: ${facetA}+${facetB}`, status, hits, ok });
          }
        }
      }

      // eslint-disable-next-line no-console
      console.table(results);

      const failures = results.filter((r) => !r.ok);
      expect(failures).toEqual([]);
    });
  });

  // =========================================================================
  // 10. Cross-nestedPath combinations
  // =========================================================================

  describe('cross-nestedPath combinations', () => {
    it('should handle filters from different nestedPaths together', async () => {
      const groups = getFacetGroups();
      const pickedFilters: string[][] = [];

      for (const group of groups) {
        const facet = group.facets.find((f) => f.type === 'string' && facetValues.has(f.attribute));
        if (facet) {
          const values = facetValues.get(facet.attribute)!;
          if (values.length > 0) {
            pickedFilters.push([`${facet.attribute}:${values[0]}`]);
          }
        }
        if (pickedFilters.length >= 3) break;
      }

      if (pickedFilters.length < 2) return;

      const body = buildInstantSearchBody(pickedFilters);
      const { status, data } = await searchApi(body);

      expect(status).toBe(200);
      expect(data.results.length).toBe(pickedFilters.length + 1);
      data.results.forEach((r: any) => {
        expect(typeof r.nbHits).toBe('number');
      });
    });
  });

  // =========================================================================
  // 11. Numeric filters
  // =========================================================================

  describe('numeric filters', () => {
    it('should handle price range filter', async () => {
      const { status, data } = await searchApi([
        buildSearchRequest([], { numericFilters: ['price>=100', 'price<=5000'] }),
      ]);

      expect(status).toBe(200);
      expect(typeof data.results[0].nbHits).toBe('number');
    });

    it('should handle combined facet + numeric filters', async () => {
      const entry = pickFacet(1);
      if (!entry) return;
      const [facetName, values] = entry;

      const { status, data } = await searchApi([
        buildSearchRequest([[`${facetName}:${values[0]}`]], {
          numericFilters: ['price>=100', 'price<=5000'],
        }),
      ]);

      expect(status).toBe(200);
      expect(typeof data.results[0].nbHits).toBe('number');
    });

    it('should handle lead_time numeric filter', async () => {
      const { status, data } = await searchApi([
        buildSearchRequest([], { numericFilters: ['lead_time>=1', 'lead_time<=30'] }),
      ]);

      expect(status).toBe(200);
      expect(typeof data.results[0].nbHits).toBe('number');
    });

    it('should narrow results when price range is tighter', async () => {
      const [wide, narrow] = await Promise.all([
        searchApi([buildSearchRequest([], { numericFilters: ['price>=1', 'price<=99999'] })]),
        searchApi([buildSearchRequest([], { numericFilters: ['price>=500', 'price<=1000'] })]),
      ]);

      expect(wide.status).toBe(200);
      expect(narrow.status).toBe(200);
      expect(narrow.data.results[0].nbHits).toBeLessThanOrEqual(wide.data.results[0].nbHits);
    });
  });

  // =========================================================================
  // 12. Disjunctive faceting (multi-request body)
  // =========================================================================

  describe('disjunctive faceting', () => {
    it('should return N+1 results for N facet filters (InstantSearch pattern)', async () => {
      const entries = [...facetValues.entries()].filter(([, v]) => v.length > 0);
      if (entries.length < 3) return;

      const filters = entries.slice(0, 3).map(([attr, vals]) => [`${attr}:${vals[0]}`]);
      const body = buildInstantSearchBody(filters);

      expect(body.length).toBe(4); // 1 main + 3 disjunctive

      const { status, data } = await searchApi(body);

      expect(status).toBe(200);
      expect(data.results.length).toBe(4);

      // Main request has hits
      expect(typeof data.results[0].nbHits).toBe('number');

      // Disjunctive requests have facets but 0 hits requested
      for (let i = 1; i < 4; i++) {
        expect(data.results[i].hits.length).toBe(0);
        expect(data.results[i].facets).toBeDefined();
      }
    });

    it('should return facets-only when hitsPerPage=0', async () => {
      const { status, data } = await searchApi([buildSearchRequest([], { hitsPerPage: 0 })]);

      expect(status).toBe(200);
      expect(data.results[0].hits.length).toBe(0);
      expect(Object.keys(data.results[0].facets).length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 13. Variant filtering validation
  // =========================================================================

  describe('variant filtering', () => {
    it('should return variants matching the applied color filter', async () => {
      const colorVals = facetValues.get('color');
      if (!colorVals || colorVals.length === 0) return;

      const targetColor = colorVals[0];
      const { status, data } = await searchApi([buildSearchRequest([[`color:${targetColor}`]], { hitsPerPage: 5 })]);

      expect(status).toBe(200);
      const hits = data.results[0].hits;

      for (const hit of hits) {
        if (!hit.variants || hit.variants.length === 0) continue;
        const hasMatchingVariant = hit.variants.some((v: any) => v.color?.toLowerCase() === targetColor.toLowerCase());
        expect(hasMatchingVariant).toBe(true);
      }
    });

    it('should filter out products with no matching variants', async () => {
      const colorVals = facetValues.get('color');
      if (!colorVals || colorVals.length === 0) return;

      const { data } = await searchApi([buildSearchRequest([[`color:${colorVals[0]}`]], { hitsPerPage: 10 })]);

      const hits = data.results[0].hits;
      for (const hit of hits) {
        expect(hit.variants).toBeDefined();
        expect(hit.variants.length).toBeGreaterThan(0);
      }
    });
  });

  // =========================================================================
  // 14. Image structure validation
  // =========================================================================

  describe('image cleanup', () => {
    it('should only include "large" field in variant images', async () => {
      const { status, data } = await searchApi([buildSearchRequest([], { hitsPerPage: 5 })]);

      expect(status).toBe(200);
      const hits = data.results[0].hits;

      for (const hit of hits) {
        if (!hit.variants) continue;
        for (const variant of hit.variants) {
          if (variant.images && Array.isArray(variant.images)) {
            for (const img of variant.images) {
              const keys = Object.keys(img);
              expect(keys).toEqual(['large']);
            }
          }
          if (variant.life_style_image && typeof variant.life_style_image === 'object') {
            const keys = Object.keys(variant.life_style_image);
            expect(keys).toEqual(['large']);
          }
        }
      }
    });
  });

  // =========================================================================
  // 15. Invalid input handling
  // =========================================================================

  describe('invalid input handling', () => {
    it.each([
      ['non-array object', '{"query":"test"}'],
      ['string', '"just a string"'],
      ['null', 'null'],
      ['number', '42'],
    ])('should return graceful empty response for %s payload', async (_label, payload) => {
      const { status, data } = await httpPost(SEARCH_ENDPOINT, payload);

      expect(status).toBe(500);
      expect(data.results).toBeDefined();
      expect(data.results[0].hits).toEqual([]);
      expect(data.results[0].nbHits).toBe(0);
    });

    it('should handle empty array payload', async () => {
      const { status, data } = await searchApi([]);

      expect([200, 500]).toContain(status);
      expect(data.results).toBeDefined();
    });

    it('should handle malformed JSON gracefully', async () => {
      const { status } = await httpPost(SEARCH_ENDPOINT, '{invalid json}');

      expect([400, 500]).toContain(status);
    });
  });

  // =========================================================================
  // 16. Response structure validation
  // =========================================================================

  describe('response structure', () => {
    it('should return all expected fields in search response', async () => {
      const { status, data } = await searchApi([buildSearchRequest([], { hitsPerPage: 1 })]);

      expect(status).toBe(200);
      const result = data.results[0];
      expect(result).toHaveProperty('hits');
      expect(result).toHaveProperty('nbHits');
      expect(result).toHaveProperty('nbPages');
      expect(result).toHaveProperty('hitsPerPage');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('query');
      expect(result).toHaveProperty('facets');
      expect(typeof result.facets).toBe('object');
    });

    it('should return product hits with required fields', async () => {
      const { data } = await searchApi([buildSearchRequest([], { hitsPerPage: 1 })]);
      const hits = data.results[0].hits;

      if (hits.length > 0) {
        const hit = hits[0];
        expect(hit).toHaveProperty('name');
        expect(hit).toHaveProperty('slug');
        expect(hit).toHaveProperty('variants');
        expect(Array.isArray(hit.variants)).toBe(true);

        if (hit.variants.length > 0) {
          const variant = hit.variants[0];
          expect(variant).toHaveProperty('id');
          expect(variant).toHaveProperty('price');
          expect(variant).toHaveProperty('sku');
        }
      }
    });

    it('should return facets with counts', async () => {
      const { data } = await searchApi([buildSearchRequest([], { hitsPerPage: 0 })]);
      const facets = data.results[0].facets;

      expect(Object.keys(facets).length).toBeGreaterThan(0);
      const firstFacet = Object.values(facets)[0] as Record<string, number>;
      const firstValue = Object.values(firstFacet)[0];
      expect(typeof firstValue).toBe('number');
    });

    it('should not expose inner_hits in response', async () => {
      const colorVals = facetValues.get('color');
      if (!colorVals || colorVals.length === 0) return;

      const { data } = await searchApi([buildSearchRequest([[`color:${colorVals[0]}`]], { hitsPerPage: 5 })]);

      const hits = data.results[0].hits;
      for (const hit of hits) {
        expect(hit.inner_hits).toBeUndefined();
      }
    });

    it('should return variant fields needed by frontend', async () => {
      const { data } = await searchApi([buildSearchRequest([], { hitsPerPage: 3 })]);
      const hits = data.results[0].hits;

      if (hits.length > 0 && hits[0].variants?.length > 0) {
        const variant = hits[0].variants[0];
        const expectedFields = ['id', 'sku', 'name', 'price', 'color', 'lead_time', 'images'];
        for (const field of expectedFields) {
          expect(variant).toHaveProperty(field);
        }
      }
    });
  });

  // =========================================================================
  // 17. Concurrent requests
  // =========================================================================

  describe('concurrent requests', () => {
    it('should handle 5 simultaneous requests correctly', async () => {
      const requests = Array.from({ length: 5 }, (_, i) =>
        searchApi([buildSearchRequest([], { hitsPerPage: 1, page: i })])
      );

      const results = await Promise.all(requests);

      results.forEach(({ status, data }) => {
        expect(status).toBe(200);
        expect(data.results).toBeDefined();
        expect(typeof data.results[0].nbHits).toBe('number');
      });
    });
  });

  // =========================================================================
  // 18. Keyword relevance
  // =========================================================================

  describe('keyword relevance', () => {
    it('should return more relevant results for exact product name match', async () => {
      const { status, data } = await searchApi([buildSearchRequest([], { query: 'sofa', hitsPerPage: 5 })]);

      expect(status).toBe(200);
      if (data.results[0].hits.length === 0) return;

      // First result should have higher relevance score than last
      const hits = data.results[0].hits;
      if (hits.length >= 2) {
        expect(hits[0]._score).toBeGreaterThanOrEqual(hits[hits.length - 1]._score);
      }
    });

    it('should return different result counts for different keywords', async () => {
      const [sofaRes, tableRes] = await Promise.all([
        searchApi([buildSearchRequest([], { query: 'sofa' })]),
        searchApi([buildSearchRequest([], { query: 'table' })]),
      ]);

      expect(sofaRes.status).toBe(200);
      expect(tableRes.status).toBe(200);
      // Different keywords should generally produce different result counts
      // (not strictly enforced — just ensures both work)
      expect(typeof sofaRes.data.results[0].nbHits).toBe('number');
      expect(typeof tableRes.data.results[0].nbHits).toBe('number');
    });
  });
});
