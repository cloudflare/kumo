/**
 * Visibility condition evaluator.
 *
 * Evaluates visibility conditions against data model and auth state.
 */

import type {
  VisibilityCondition,
  LogicExpression,
  DataModel,
  AuthState,
} from "./types";
import { getByPath, resolveDynamicValue } from "./data";

/**
 * Context for evaluating visibility conditions.
 */
export interface VisibilityContext {
  /** Data model for path resolution */
  data: DataModel;
  /** Authentication state */
  auth: AuthState;
}

/**
 * Check if a value is truthy.
 */
function isTruthy(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return Boolean(value);
}

/**
 * Evaluate a logic expression.
 */
function evaluateLogicExpression(
  expr: LogicExpression,
  ctx: VisibilityContext,
): boolean {
  // Path check - truthy test
  if ("path" in expr && !("eq" in expr) && !("neq" in expr)) {
    const value = getByPath(ctx.data, expr.path);
    return isTruthy(value);
  }

  // AND - all must be true
  if ("and" in expr) {
    return expr.and.every((e) => evaluateLogicExpression(e, ctx));
  }

  // OR - at least one must be true
  if ("or" in expr) {
    return expr.or.some((e) => evaluateLogicExpression(e, ctx));
  }

  // NOT - negate
  if ("not" in expr) {
    return !evaluateLogicExpression(expr.not, ctx);
  }

  // Equality check
  if ("eq" in expr) {
    const eqExpr = expr as { eq: [unknown, unknown] };
    const valueA = resolveDynamicValue(eqExpr.eq[0], ctx.data);
    const valueB = resolveDynamicValue(eqExpr.eq[1], ctx.data);
    return valueA === valueB;
  }

  // Inequality check
  if ("neq" in expr) {
    const neqExpr = expr as { neq: [unknown, unknown] };
    const valueA = resolveDynamicValue(neqExpr.neq[0], ctx.data);
    const valueB = resolveDynamicValue(neqExpr.neq[1], ctx.data);
    return valueA !== valueB;
  }

  // Greater than
  if ("gt" in expr) {
    const gtExpr = expr as { gt: [unknown, unknown] };
    const valueA = resolveDynamicValue(gtExpr.gt[0], ctx.data) as number;
    const valueB = resolveDynamicValue(gtExpr.gt[1], ctx.data) as number;
    return valueA > valueB;
  }

  // Greater than or equal
  if ("gte" in expr) {
    const gteExpr = expr as { gte: [unknown, unknown] };
    const valueA = resolveDynamicValue(gteExpr.gte[0], ctx.data) as number;
    const valueB = resolveDynamicValue(gteExpr.gte[1], ctx.data) as number;
    return valueA >= valueB;
  }

  // Less than
  if ("lt" in expr) {
    const ltExpr = expr as { lt: [unknown, unknown] };
    const valueA = resolveDynamicValue(ltExpr.lt[0], ctx.data) as number;
    const valueB = resolveDynamicValue(ltExpr.lt[1], ctx.data) as number;
    return valueA < valueB;
  }

  // Less than or equal
  if ("lte" in expr) {
    const lteExpr = expr as { lte: [unknown, unknown] };
    const valueA = resolveDynamicValue(lteExpr.lte[0], ctx.data) as number;
    const valueB = resolveDynamicValue(lteExpr.lte[1], ctx.data) as number;
    return valueA <= valueB;
  }

  // Unknown expression type - default to visible
  return true;
}

/**
 * Evaluate a visibility condition.
 *
 * @example
 * // Boolean
 * evaluateVisibility(true, ctx) // true
 *
 * // Path check
 * evaluateVisibility({ path: "/user/isAdmin" }, ctx) // depends on data
 *
 * // Auth check
 * evaluateVisibility({ auth: "signedIn" }, ctx) // depends on auth state
 *
 * // Complex logic
 * evaluateVisibility({
 *   and: [
 *     { path: "/user/isAdmin" },
 *     { auth: "signedIn" }
 *   ]
 * }, ctx)
 */
export function evaluateVisibility(
  condition: VisibilityCondition | undefined,
  ctx: VisibilityContext,
): boolean {
  // No condition means always visible
  if (condition === undefined) {
    return true;
  }

  // Boolean literal
  if (typeof condition === "boolean") {
    return condition;
  }

  // Auth check
  if ("auth" in condition) {
    if (condition.auth === "signedIn") {
      return ctx.auth.isSignedIn;
    }
    if (condition.auth === "signedOut") {
      return !ctx.auth.isSignedIn;
    }
    return true;
  }

  // Path check (simple truthy test)
  if ("path" in condition && !("and" in condition) && !("or" in condition)) {
    const value = getByPath(ctx.data, condition.path);
    return isTruthy(value);
  }

  // Logic expression
  return evaluateLogicExpression(condition as LogicExpression, ctx);
}

/**
 * Create a default visibility context.
 */
export function createVisibilityContext(
  data: DataModel = {},
  auth: Partial<AuthState> = {},
): VisibilityContext {
  return {
    data,
    auth: {
      isSignedIn: auth.isSignedIn ?? false,
      user: auth.user,
    },
  };
}
