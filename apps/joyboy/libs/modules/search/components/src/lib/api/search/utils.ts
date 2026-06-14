// Fix type for interfaces
type SearchRequest = Record<string, any>;

/**
 * Recursively find all nested queries in an object and apply inner_hits configuration
 */
function processNestedQueries(obj: any, usedNames: Set<string>, requestIndex: number, path = ''): void {
  if (!obj || typeof obj !== 'object') return;

  // Check if this is a nested query
  if (obj.nested && obj.nested.path) {
    const nestedPath = obj.nested.path;
    const isVariantsPath = nestedPath === 'variants' || nestedPath.startsWith('variants.');

    // Ensure inner_hits exists
    if (!obj.nested.inner_hits) {
      obj.nested.inner_hits = {};
    }

    if (isVariantsPath) {
      // Only request full inner_hits data for variants (needed by variant filtering logic)
      if (!obj.nested.inner_hits.size || obj.nested.inner_hits.size < 100) {
        obj.nested.inner_hits.size = 100;
      }
      if (!obj.nested.inner_hits._source) {
        obj.nested.inner_hits._source = true;
      }
    }

    // Deduplicate inner_hits names for ALL nested paths to prevent
    // Elasticsearch "already contains an entry for key" errors
    let baseName;
    if (isVariantsPath) {
      baseName = nestedPath;
    } else {
      baseName = nestedPath.replace(/\./g, '_');
    }

    const uniqueName = path ? `${baseName}_${path}` : baseName;
    let finalName = uniqueName;
    let counter = 1;

    while (usedNames.has(finalName)) {
      finalName = `${uniqueName}_${counter}`;
      counter++;
    }

    usedNames.add(finalName);
    obj.nested.inner_hits.name = finalName;
  }

  // Recursively process all nested objects and arrays
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newPath = path ? `${path}_${key}` : key;
      if (Array.isArray(obj[key])) {
        obj[key].forEach((item: any, index: number) => {
          processNestedQueries(item, usedNames, requestIndex, `${newPath}_${index}`);
        });
      } else if (typeof obj[key] === 'object') {
        processNestedQueries(obj[key], usedNames, requestIndex, newPath);
      }
    }
  }
}

/**
 * https://github.com/searchkit/searchkit/issues/1376#issuecomment-2181397533
 * Enhanced version that handles ALL nested queries (including numericFilters)
 * @param requests
 */
export function addNestedFilterInnerHitsNames(requests: SearchRequest[]): void {
  const usedNames = new Set<string>(); // Track used names globally across all requests

  for (let requestIndex = 0; requestIndex < requests.length; requestIndex++) {
    const request = requests[requestIndex];

    // Get the entire query object
    const query = getNestedValue(request, 'body.query');
    if (!query) {
      continue;
    }

    // Process all nested queries recursively
    processNestedQueries(query, usedNames, requestIndex, `r${requestIndex}`);
  }
}

// Helper function to get nested value from object
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }

  return current;
}
