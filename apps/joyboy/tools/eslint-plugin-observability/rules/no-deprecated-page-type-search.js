'use strict';

/**
 * Rule: no-deprecated-page-type-search (error)
 * PAGE_TYPES.SEARCH is deleted. Use PAGE_TYPES.PLP + domain: BUSINESS_DOMAIN.SEARCH instead.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'PAGE_TYPES.SEARCH is deleted — use PAGE_TYPES.PLP + domain: BUSINESS_DOMAIN.SEARCH',
    },
    messages: {
      deprecated: 'PAGE_TYPES.SEARCH is deleted. Use PAGE_TYPES.PLP with domain: BUSINESS_DOMAIN.SEARCH instead.',
    },
    schema: [],
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'PAGE_TYPES' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'SEARCH'
        ) {
          context.report({ node, messageId: 'deprecated' });
        }
      },
    };
  },
};
