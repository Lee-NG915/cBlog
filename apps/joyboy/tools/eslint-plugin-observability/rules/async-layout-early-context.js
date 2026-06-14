'use strict';

/**
 * Rule: async-layout-early-context (warn)
 * Async layout.tsx files that contain await expressions must call
 * setGlobalSentryContext() before the first await, so that Sentry context
 * is available even when an async operation throws before the Provider renders.
 *
 * Hard Rule #4 (CLAUDE.md): async layout exception — call setGlobalSentryContext
 * _before_ the first await. Known cases: shop-the-look, home layout.
 *
 * Applies to files whose basename is exactly: layout.tsx / layout.jsx
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Async layout.tsx files with await must call setGlobalSentryContext before the first await',
    },
    messages: {
      missingEarlyContext:
        'Async layout with await must call setGlobalSentryContext before the first await to ensure Sentry context is set before potential throws. See CLAUDE.md Rule #4.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();

    // Only apply to layout.{tsx,jsx} files
    if (!/(?:^|\/)layout\.[jt]sx?$/.test(filename)) return {};
    if (/\.spec\.|\.stories\./.test(filename)) return {};

    /**
     * Returns true if a statement (at the top level of a function body) contains
     * a CallExpression to setGlobalSentryContext — either directly as an
     * ExpressionStatement, or as the init/expression of a variable declarator.
     * Only inspects the immediate statement, not deep nesting, to be conservative.
     */
    function statementCallsSetGlobalSentryContext(stmt) {
      if (!stmt) return false;

      // ExpressionStatement: setGlobalSentryContext(...)
      if (
        stmt.type === 'ExpressionStatement' &&
        stmt.expression.type === 'CallExpression' &&
        stmt.expression.callee.type === 'Identifier' &&
        stmt.expression.callee.name === 'setGlobalSentryContext'
      ) {
        return true;
      }

      // VariableDeclaration: const x = setGlobalSentryContext(...)
      if (stmt.type === 'VariableDeclaration') {
        return stmt.declarations.some(
          (d) =>
            d.init &&
            d.init.type === 'CallExpression' &&
            d.init.callee.type === 'Identifier' &&
            d.init.callee.name === 'setGlobalSentryContext'
        );
      }

      return false;
    }

    /**
     * Returns true if a statement (top-level) *contains* an AwaitExpression
     * anywhere within it (shallow walk via JSON-like traversal of known node types).
     */
    function statementContainsAwait(stmt) {
      if (!stmt) return false;

      function walk(node) {
        if (!node || typeof node !== 'object') return false;
        if (node.type === 'AwaitExpression') return true;

        // Don't descend into nested function bodies — those awaits are unrelated
        if (
          node.type === 'FunctionDeclaration' ||
          node.type === 'FunctionExpression' ||
          node.type === 'ArrowFunctionExpression'
        ) {
          return false;
        }

        for (const key of Object.keys(node)) {
          if (key === 'type' || key === 'parent') continue;
          const child = node[key];
          if (Array.isArray(child)) {
            if (child.some((c) => walk(c))) return true;
          } else if (child && typeof child === 'object' && child.type) {
            if (walk(child)) return true;
          }
        }
        return false;
      }

      return walk(stmt);
    }

    /**
     * Validate the body (BlockStatement.body array) of an async default-export function.
     */
    function checkFunctionBody(bodyStatements, reportNode) {
      // Find index of the first statement that contains an await
      const firstAwaitIndex = bodyStatements.findIndex((s) => statementContainsAwait(s));

      // No awaits at all — rule does not apply
      if (firstAwaitIndex === -1) return;

      // Check whether any statement *before* the first await calls setGlobalSentryContext
      const statementsBeforeAwait = bodyStatements.slice(0, firstAwaitIndex);
      const hasEarlyCall = statementsBeforeAwait.some((s) => statementCallsSetGlobalSentryContext(s));

      if (!hasEarlyCall) {
        context.report({ node: reportNode, messageId: 'missingEarlyContext' });
      }
    }

    // Track whether we've seen `export default` to identify the default export function
    // We inspect two patterns:
    //   export default async function Layout() { ... }
    //   export default async (...) => { ... }

    return {
      ExportDefaultDeclaration(node) {
        const decl = node.declaration;

        // Pattern 1: export default async function ...
        if (decl.type === 'FunctionDeclaration' && decl.async && decl.body) {
          checkFunctionBody(decl.body.body, node);
          return;
        }

        // Pattern 2: export default async (...) => { ... }
        if (decl.type === 'ArrowFunctionExpression' && decl.async && decl.body && decl.body.type === 'BlockStatement') {
          checkFunctionBody(decl.body.body, node);
        }
      },
    };
  },
};
