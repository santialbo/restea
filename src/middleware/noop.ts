import { Middleware } from 'koa';

/**
 * Middleware that does nothing, just calls `await next()`.
 */
export const noop: Middleware = async (ctx, next) => {
  await next();
};
