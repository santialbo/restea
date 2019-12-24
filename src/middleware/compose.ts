import { DefaultContext, DefaultState, Middleware } from 'koa';
import { META, withMetadata, WithMetadata } from '../open-api';

type M<StateT = DefaultState, CustomT = DefaultContext> = WithMetadata<
  Middleware<StateT, CustomT>
>;

/**
 * Compose `middleware` returning a fully valid middleware comprised of all
 * those which are passed.
 * @param middleware The middleware to compose.
 */
export function compose<T1, U1>(...middleware: [M<T1, U1>]): M<T1, U1>;
export function compose<T1, U1, T2, U2>(
  ...middleware: [M<T1, U1>, M<T2, U2>]
): M<T1 & T2, U1 & U2>;
export function compose<T1, U1, T2, U2, T3, U3>(
  ...middleware: [M<T1, U1>, M<T2, U2>, M<T3, U3>]
): M<T1 & T2 & T3, U1 & U2 & U3>;
export function compose<T1, U1, T2, U2, T3, U3, T4, U4>(
  ...middleware: [M<T1, U1>, M<T2, U2>, M<T3, U3>, M<T4, U4>]
): M<T1 & T2 & T3 & T4, U1 & U2 & U3 & U4>;
export function compose<T1, U1, T2, U2, T3, U3, T4, U4, T5, U5>(
  ...middleware: [M<T1, U1>, M<T2, U2>, M<T3, U3>, M<T4, U4>, M<T5, U5>]
): M<T1 & T2 & T3 & T4 & T5, U1 & U2 & U3 & U4 & U5>;
export function compose<T1, U1, T2, U2, T3, U3, T4, U4, T5, U5, T6, U6>(
  ...middleware: [
    M<T1, U1>,
    M<T2, U2>,
    M<T3, U3>,
    M<T4, U4>,
    M<T5, U5>,
    M<T6, U6>
  ]
): M<T1 & T2 & T3 & T4 & T5 & T6, U1 & U2 & U3 & U4 & U5 & U6>;
export function compose<T1, U1, T2, U2, T3, U3, T4, U4, T5, U5, T6, U6, T7, U7>(
  ...middleware: [
    M<T1, U1>,
    M<T2, U2>,
    M<T3, U3>,
    M<T4, U4>,
    M<T5, U5>,
    M<T6, U6>,
    M<T7, U7>
  ]
): M<T1 & T2 & T3 & T4 & T5 & T6 & T7, U1 & U2 & U3 & U4 & U5 & U6 & U7>;
export function compose<T extends {}>(...middleware: M<T>[]): M<T> {
  for (const fn of middleware) {
    if (typeof fn !== 'function')
      throw new TypeError('Middleware must be composed of functions!');
  }
  return withMetadata(
    async (ctx, next) => {
      // last called middleware #
      let index = -1;
      await dispatch(0);
      async function dispatch(i: number) {
        if (i <= index) {
          throw new Error('next() called multiple times');
        }
        index = i;
        if (i === middleware.length) {
          await next();
        } else {
          await middleware[i](ctx, dispatch.bind(null, i + 1));
        }
      }
    },
    defs => {
      for (const { [META]: meta } of middleware) {
        if (meta) {
          meta(defs);
        }
      }
    }
  );
}
