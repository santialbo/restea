import { Middleware } from 'koa';
import { HttpError } from './HttpError';
import uuid from 'uuid';

const dev = process.env.NODE_ENV !== 'production';

export function errorHandler(): Middleware<{ id: string }> {
  return async (ctx, next) => {
    const id = uuid.v4();
    try {
      await next();
    } catch (error) {
      if (error instanceof HttpError) {
        ctx.body = {
          error: error.toResponse(),
        };
        ctx.status = error.status;
      } else {
        ctx.body = {
          id,
          error: {
            status: 500,
            code: 'UnhandledError',
            message: dev ? error.message : 'An unknown error occurred',
            stack: dev ? error.stack : undefined,
          },
        };
        ctx.status = 500;
      }
    }
  };
}
