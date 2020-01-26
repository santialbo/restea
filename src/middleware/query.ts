import { Middleware, ParameterizedContext, DefaultContext } from 'koa';
import { InvalidParameterError } from '../errors';
import { ParameterObject, WithMetadata } from '../open-api';
import {
  addOperationParameter,
  addParameterComponent,
  combineMetadata,
  withMetadata,
} from '../open-api';
import { ParameterValidator, ValidationError } from '../validators';
import { compose } from './compose';
import { throws } from './throws';

export type QueryOptions<T> = {
  /**
   * The description of the parameter to use in the generated Open API schema.
   */
  description?: string;
  /**
   * Treat empty string in the same way as if the parameter is not passed.
   */
  ignoreEmpty?: boolean;
  /**
   * Store the schema in the components section of the generated Open API
   * schema. Use this option if this parameter is used in many endpoints.
   */
  storeAsComponent?: boolean;
  /**
   * Whether the parameter is required. If set to `true` the endpoint will
   * return an error when the parameter is not present. Defaults to `false`.
   */
  required?: boolean;
  /**
   * The default value to provide inside `ctx.state.params` when a value is not
   * provided.
   */
  default?: T;
};

export interface RequiredQueryOptions<T> extends QueryOptions<T> {
  required: true;
}

/*
 * Note about these overloads:
 *
 * In the actual runtime implementation, due to limitations of TS's type logic
 * (and possibly limitations of my own knowledge of TS), we just define the
 * function as always returning OptionalMiddleware. The narrowing happens based
 * just on the type overload.
 *
 * Because of this, it could be possible to break the below logic such that
 * undefined values were returned from query() with {required: true}, since
 * nothing actually type checks that.
 * 
 * Ideally, unit tests should be added to cover this :)
 */

type WithRequiredParam<TName extends string, TType> = { params: { [key in TName]: TType; } }
type WithOptionalParam<TName extends string, TType> = { params: { [key in TName]: TType | undefined; } }

type RequiredMiddleware<TName extends string, TType> = WithMetadata<Middleware<WithRequiredParam<TName, TType>, DefaultContext>>;
type OptionalMiddleware<TName extends string, TType> = WithMetadata<Middleware<WithOptionalParam<TName, TType>, DefaultContext>>;

export function query<TName extends string, TType>(
  name: TName,
  validator: ParameterValidator<TType>,
  opts: RequiredQueryOptions<TType>
): RequiredMiddleware<TName, TType>;

export function query<TName extends string, TType>(
  name: TName,
  validator: ParameterValidator<TType>,
  opts: QueryOptions<TType>
): OptionalMiddleware<TName, TType>;

/**
 * Ensures that the query parameter with the specified name is valid.
 * @param name The name of the parameter.
 * @param validator A parameter validator that validates and maps the value.
 * @param opts Additional options.
 */
export function query<TName extends string, TType>(
  name: TName,
  validator: ParameterValidator<TType>,
  opts: QueryOptions<TType> = {}
): OptionalMiddleware<TName, TType> {
  opts = {
    required: false,
    default: <TType>(<unknown>null),
    ignoreEmpty: true,
    storeAsComponent: false,
    ...opts,
  };
  const schema: ParameterObject = {
    name,
    in: 'query',
    required: opts.required,
    description: opts.description,
    schema: validator.schema as any,
  };
  return compose(
    withMetadata<Middleware<WithOptionalParam<TName, TType>>>(
      async (ctx, next) => {
        let value = ctx.query[name];
        if (Array.isArray(value)) {
          value = value[0];
        }
        ctx.state.params = ctx.state.params ?? {};
        try {
          const valueMissing =
            typeof value === 'undefined' || (!opts.ignoreEmpty && value === '');
          if (valueMissing) {
            if (opts.required) {
              throw new InvalidParameterError(
                name,
                'query',
                new ValidationError('Required parameter is missing.')
              );
            } else {
              ctx.state.params[name] = opts.default;
            }
          } else {
            ctx.state.params[name] = await validator.validate(value);
          }
          await next();
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new InvalidParameterError(name, 'query', error);
          } else {
            throw error;
          }
        }
      },
      opts.storeAsComponent
        ? combineMetadata(
            addParameterComponent(name, schema),
            addOperationParameter({ $ref: `#/components/parameters/${name}` })
          )
        : addOperationParameter(schema)
    ),
    throws(InvalidParameterError)
  );
}
