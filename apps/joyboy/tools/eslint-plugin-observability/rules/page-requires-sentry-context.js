'use strict';

/**
 * Rule: page-requires-sentry-context (warn)
 * Every server-side page.tsx must call setGlobalSentryContext({ pageType, domain }).
 *
 * Client components ('use client') are excluded — they inherit context from
 * the parent layout's <SentryContextProvider> and cannot call server-only APIs.
 *
 * Applies to files whose basename is exactly: page.ts / page.tsx / page.js / page.jsx
 * Excludes: spec files, storybook files, client components.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Server-side page.tsx files must call setGlobalSentryContext for Sentry isolation scope',
    },
    messages: {
      missingContext:
        'This page.tsx is missing setGlobalSentryContext({ pageType, domain }). Every server-side page must set Sentry isolation scope.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();

    // Only apply to page.{ts,tsx,js,jsx} files (not specs, not storybook)
    if (!/(?:^|\/)page\.[jt]sx?$/.test(filename)) return {};
    if (/\.spec\.|\.stories\./.test(filename)) return {};

    let found = false;
    let isClientComponent = false;

    return {
      Program(programNode) {
        // 'use client' directive appears as ExpressionStatement > Literal at the top
        const first = programNode.body[0];
        if (
          first?.type === 'ExpressionStatement' &&
          first.expression?.type === 'Literal' &&
          typeof first.expression.value === 'string' &&
          first.expression.value === 'use client'
        ) {
          isClientComponent = true;
        }
      },

      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'setGlobalSentryContext') {
          found = true;
        }
      },

      'Program:exit'(programNode) {
        if (isClientComponent) return; // client pages get context from layout's SentryContextProvider
        if (!found) {
          context.report({ node: programNode, messageId: 'missingContext' });
        }
      },
    };
  },
};
