'use strict';

/**
 * Rule: no-double-reporting (error)
 * Detects logger.error paired with Sentry.captureException OR captureStructuredError
 * in the same catch block.
 * captureStructuredError already handles both logging and Sentry reporting internally,
 * so calling logger.error alongside it double-reports to stdout.
 */

// AST child keys that contain child nodes (subset that avoids circular parent refs)
const CHILD_KEYS = {
  BlockStatement: ['body'],
  ExpressionStatement: ['expression'],
  CallExpression: ['callee', 'arguments'],
  MemberExpression: ['object', 'property'],
  IfStatement: ['consequent', 'alternate'],
  ReturnStatement: ['argument'],
  VariableDeclaration: ['declarations'],
  VariableDeclarator: ['init'],
  AssignmentExpression: ['right'],
  AwaitExpression: ['argument'],
  LogicalExpression: ['left', 'right'],
  ConditionalExpression: ['consequent', 'alternate'],
  SequenceExpression: ['expressions'],
};

const NESTED_SCOPE_TYPES = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);

function collectCallsInBody(body) {
  const calls = [];
  const queue = [body];

  while (queue.length > 0) {
    const node = queue.shift();
    if (!node || typeof node !== 'object' || !node.type) continue;
    if (NESTED_SCOPE_TYPES.has(node.type)) continue;

    if (node.type === 'CallExpression') calls.push(node);

    const keys = CHILD_KEYS[node.type];
    if (!keys) continue;

    for (const key of keys) {
      const child = node[key];
      if (Array.isArray(child)) {
        queue.push(...child);
      } else if (child) {
        queue.push(child);
      }
    }
  }

  return calls;
}

function isLoggerError(node) {
  return (
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'logger' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'error'
  );
}

function isSentryCapture(node) {
  return (
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'Sentry' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'captureException'
  );
}

function isCaptureStructuredError(node) {
  return node.callee.type === 'Identifier' && node.callee.name === 'captureStructuredError';
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Avoid double-reporting: logger.error paired with Sentry capture in the same catch block',
    },
    messages: {
      doubleReporting:
        'Double-reporting detected: logger.error and a Sentry capture call are both in this catch block. Use captureStructuredError which handles both.',
    },
    schema: [],
  },
  create(context) {
    return {
      CatchClause(node) {
        const calls = collectCallsInBody(node.body);
        const hasLoggerError = calls.some(isLoggerError);
        const hasCapture = calls.some(isSentryCapture) || calls.some(isCaptureStructuredError);

        if (hasLoggerError && hasCapture) {
          context.report({ node, messageId: 'doubleReporting' });
        }
      },
    };
  },
};
