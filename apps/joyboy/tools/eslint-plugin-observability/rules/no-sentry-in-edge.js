'use strict';

/**
 * Rule: no-sentry-in-edge (error)
 * Sentry capture / tracing APIs must not be called in middleware or edge runtime files.
 * logger.* is allowed — it writes to stdout only.
 *
 * Applies to:
 *   - Files named middleware.ts / middleware.tsx (any depth)
 *   - Files that export `export const runtime = 'edge'`
 */

const BANNED_IDENTIFIERS = new Set(['captureStructuredError', 'withServerActionInstrumentation', 'withFetchSpan']);

function isSentryCapture(node) {
  return (
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'Sentry' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'captureException'
  );
}

function isBannedIdentifierCall(node) {
  return node.callee.type === 'Identifier' && BANNED_IDENTIFIERS.has(node.callee.name);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Sentry capture APIs are not allowed in middleware or edge runtime files',
    },
    messages: {
      noSentryInEdge:
        'Sentry capture APIs ({{name}}) are not allowed in middleware/edge runtime. Use logger.* instead.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    const isMiddlewareFile = /(?:^|\/)middleware\.[jt]sx?$/.test(filename);

    let isEdgeRuntime = false;
    // Collect violations to report: needed because runtime = 'edge' may appear
    // after the call expressions in large files (rare, but correct to handle).
    const pendingViolations = [];

    function checkCall(node) {
      if (isSentryCapture(node)) {
        const name = 'Sentry.captureException';
        return { node, name };
      }
      if (isBannedIdentifierCall(node)) {
        return { node, name: node.callee.name };
      }
      return null;
    }

    return {
      // Detect: export const runtime = 'edge'
      ExportNamedDeclaration(declNode) {
        const decl = declNode.declaration;
        if (!decl || decl.type !== 'VariableDeclaration') return;
        for (const declarator of decl.declarations) {
          if (
            declarator.id.type === 'Identifier' &&
            declarator.id.name === 'runtime' &&
            declarator.init?.type === 'Literal' &&
            declarator.init.value === 'edge'
          ) {
            isEdgeRuntime = true;
          }
        }
      },

      CallExpression(node) {
        const violation = checkCall(node);
        if (!violation) return;

        if (isMiddlewareFile) {
          context.report({
            node: violation.node,
            messageId: 'noSentryInEdge',
            data: { name: violation.name },
          });
        } else {
          // May be an edge file — defer until Program:exit
          pendingViolations.push(violation);
        }
      },

      'Program:exit'() {
        if (!isEdgeRuntime) return;
        for (const violation of pendingViolations) {
          context.report({
            node: violation.node,
            messageId: 'noSentryInEdge',
            data: { name: violation.name },
          });
        }
      },
    };
  },
};
