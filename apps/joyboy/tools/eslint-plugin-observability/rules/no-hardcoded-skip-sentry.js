'use strict';

/**
 * Rule: no-hardcoded-skip-sentry (warn)
 *
 * Detects `skipSentry: true` used as a boolean literal in-place.
 *
 * The problem is not that skipSentry is wrong — sometimes silencing a specific error path is
 * the right call (e.g. a user-facing Facebook login edge case where you know 100% of errors
 * are non-actionable). The problem is that `true` in-line carries zero intent documentation.
 *
 * Two acceptable patterns:
 *
 * A) Error-type predicate (preferred when the skip condition is based on error shape):
 *      skipSentry: isUserInputError(error)       — 400 credential/format, 422 validation
 *      skipSentry: isExpectedBusinessError(error) — 404, 409, out-of-stock 400s
 *      skipSentry: isAuthError(error)            — 401, 403
 *      skipSentry: shouldSkipSentry(error)       — combines all three
 *
 * B) Named boolean constant (required when the skip is unconditional by design):
 *      // This path always produces a user-facing FB email-unavailable error — not actionable in Sentry
 *      const skipFbEmailError = true;
 *      captureStructuredError(error, { skipSentry: skipFbEmailError, ... });
 *
 * Both patterns make the decision explicit and searchable. Inline `true` does neither.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow skipSentry: true literal inline — use a predicate helper or a named boolean constant with a comment',
    },
    messages: {
      noHardcodedSkipSentry:
        'skipSentry: true inline silences errors without documenting why. ' +
        'If the skip depends on error type, use a predicate: isUserInputError(error), isExpectedBusinessError(error), isAuthError(error), or shouldSkipSentry(error). ' +
        'If it is unconditionally intentional, extract to a named boolean constant with a comment explaining why every error here is non-actionable.',
    },
    schema: [],
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          ((node.key.type === 'Identifier' && node.key.name === 'skipSentry') ||
            (node.key.type === 'Literal' && node.key.value === 'skipSentry')) &&
          node.value &&
          node.value.type === 'Literal' &&
          node.value.value === true
        ) {
          context.report({ node, messageId: 'noHardcodedSkipSentry' });
        }
      },
    };
  },
};
