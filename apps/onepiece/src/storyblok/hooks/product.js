import { useEffect, useState } from 'react';
import { _sortFilterVariantsByColor } from 'containers/Category/EnhancedSearchkitManager/utils';
import { postProductSearch } from 'api/search';

export function useProductLoader(productId) {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const checkValue = (value) => {
    if (value !== null && value !== undefined) {
      if (typeof value === 'number' || typeof value === 'string') {
        return value !== '';
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
    }
    return false;
  };

  useEffect(() => {
    const loadProducts = async (id) => {
      try {
        const response = await postProductSearch({
          query: {
            bool: {
              must: {
                ids: {
                  values: [...(Array.isArray(id) ? id : [id])],
                },
              },
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
            },
          },
          size: 32,
        });

        const formatData = response.hits.hits.map((h) => ({
          ...h._source,
          ..._sortFilterVariantsByColor(h._source.variants),
        }));

        setLoaded(true);
        setProducts(formatData);
      } catch (err) {
        console.error(
          JSON.stringify(
            {
              message: 'Error loading product in storyblok',
              error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
            },
            null,
            2
          )
        );
        setLoaded(true);
        setProducts([]);
      }
    };

    if (checkValue(productId)) {
      loadProducts(productId);
    } else {
      setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { products, loaded };
}
