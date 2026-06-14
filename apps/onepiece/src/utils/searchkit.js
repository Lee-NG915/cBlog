/**
 * @description elasticsearch query (upgrade at 2023-03-09)
 * @bofore 2.x docs https://www.elastic.co/guide/en/elasticsearch/reference/2.3
 * @docs 7.x https://www.elastic.co/guide/en/elasticsearch/reference/7.17/elasticsearch-intro.html
 */

import { AnonymousAccessor, TermQuery, BoolMust, MatchQuery } from 'searchkit';

const variantsNotEmptyFilter = {
  filter: {
    nested: {
      path: 'variants',
      query: {
        bool: {
          filter: {
            exists: {
              field: 'variants',
            },
          },
        },
      },
    },
  },
};

export const getTypeAccessor = (permalink) => {
  if (!permalink) {
    return new AnonymousAccessor((query) =>
      query.addQuery({
        bool: variantsNotEmptyFilter,
      })
    );
  }

  return new AnonymousAccessor((query) =>
    query.addQuery({
      bool: {
        must: {
          nested: {
            path: 'categories',
            // ES 7.x don‘t surport filter in nested docs: https://www.elastic.co/guide/en/elasticsearch/reference/5.0/breaking_50_search_changes.html
            query: {
              term: {
                'categories.permalink': permalink,
              },
            },
          },
        },
        ...variantsNotEmptyFilter,
      },
    })
  );
};
