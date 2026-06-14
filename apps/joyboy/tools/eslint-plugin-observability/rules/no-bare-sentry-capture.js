'use strict';

/**
 * Rule: no-bare-sentry-capture (warn)
 *
 * Detection 1: Direct Sentry.captureException() calls.
 *   Use captureStructuredError from @castlery/observability instead.
 *
 * Detection 2 (Hard Rule #5): withServerActionInstrumentation wrapping a degradation path.
 *   Degradation paths (catch block with return) must NOT use withServerActionInstrumentation
 *   because it force re-throws, breaking graceful degradation.
 *   Use captureStructuredError in the catch block instead.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Use captureStructuredError instead of bare Sentry.captureException; detect withServerActionInstrumentation misuse on degradation paths',
    },
    messages: {
      noBareCapture:
        'Use captureStructuredError from @castlery/observability instead of Sentry.captureException directly.',
      degradationPathMisuse:
        'Degradation paths (catch block that returns instead of throwing) must not use withServerActionInstrumentation — it force re-throws. Use captureStructuredError in the catch block instead. See CLAUDE.md Rule #5.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        // Detection 1: bare Sentry.captureException
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'Sentry' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'captureException'
        ) {
          context.report({ node, messageId: 'noBareCapture' });
          return;
        }

        // Detection 2: withServerActionInstrumentation wrapping a degradation path
        if (node.callee.type === 'Identifier' && node.callee.name === 'withServerActionInstrumentation') {
          const firstArg = node.arguments[0];
          if (
            firstArg &&
            (firstArg.type === 'FunctionExpression' || firstArg.type === 'ArrowFunctionExpression') &&
            firstArg.async &&
            firstArg.body.type === 'BlockStatement'
          ) {
            for (const stmt of firstArg.body.body) {
              if (stmt.type === 'TryStatement' && stmt.handler) {
                const catchStatements = stmt.handler.body.body;
                // Degradation path: catch block has a ReturnStatement (doesn't re-throw)
                const hasCatchReturn = catchStatements.some((s) => s.type === 'ReturnStatement');
                if (hasCatchReturn) {
                  context.report({ node, messageId: 'degradationPathMisuse' });
                }
              }
            }
          }
        }
      },
    };
  },
};
