import { Middleware } from 'koa';
import { InvalidParameterError } from '../errors';
import { updatePathParameter, withMetadata } from '../open-api';
import { ParameterValidator } from '../validators';
import { compose } from './compose';
import { throws } from './throws';

export interface ParameterOptions {
  /**
   * The description of the parameter to use in the generated Open API schema.
   */
  description?: string;
}

/**
 * Ensures that the path parameter with the specified name is valid.
 * @param name The name of the parameter.
 * @param validator A parameter validator that validates and maps the value.
 * @param opts Additional options.
 */
export function parameter<TName extends string, TType>(
  name: TName,
  validator: ParameterValidator<TType>,
  opts: ParameterOptions = {}
) {
  return compose(
    withMetadata<Middleware<{ params: { [key in TName]: TType } }>>(
      async (ctx, next) => {
        const value = ctx.params[name];
        try {
          ctx.state.params = ctx.state.params ?? {};
          ctx.state.params[name] = await validator.validate(value);
          await next();
        } catch (error) {
          throw new InvalidParameterError(name, 'path', error);
        }
      },
      updatePathParameter(name, {
        description: opts.description,
        schema: validator.schema as any,
      })
    ),
    throws(InvalidParameterError)
  );
}
