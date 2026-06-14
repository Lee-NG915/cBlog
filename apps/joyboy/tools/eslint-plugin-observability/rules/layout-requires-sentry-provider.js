'use strict';

/**
 * Rule: layout-requires-sentry-provider (warn)
 * Every layout.tsx must render <SentryContextProvider>.
 *
 * Hard Rule #3: layout missing <SentryContextProvider> → missingProvider
 * Note: setGlobalSentryContext() is permitted in layouts (e.g. async-layout exception in CLAUDE.md Rule #4).
 *
 * Applies to files whose basename is exactly: layout.tsx / layout.jsx
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'layout.tsx files must use <SentryContextProvider> for Sentry context',
    },
    messages: {
      missingProvider:
        'This layout.tsx is missing <SentryContextProvider>. Layouts must wrap content with SentryContextProvider.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();

    // Only apply to layout.{tsx,jsx} files
    if (!/(?:^|\/)layout\.[jt]sx?$/.test(filename)) return {};
    if (/\.spec\.|\.stories\./.test(filename)) return {};

    let found = false;

    return {
      JSXOpeningElement(node) {
        const name = node.name;
        if (
          (name.type === 'JSXIdentifier' && name.name === 'SentryContextProvider') ||
          (name.type === 'JSXMemberExpression' &&
            name.property.type === 'JSXIdentifier' &&
            name.property.name === 'SentryContextProvider')
        ) {
          found = true;
        }
      },

      'Program:exit'(programNode) {
        if (!found) {
          context.report({ node: programNode, messageId: 'missingProvider' });
        }
      },
    };
  },
};
