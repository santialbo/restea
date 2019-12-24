import { Middleware } from 'koa';
import { JsonSchema, validate } from '../json-schema';
import {
  addOperationResponse,
  addResponseComponent,
  combineMetadata,
  withMetadata,
} from '../open-api';

const dev = process.env.NODE_ENV !== 'production';

export interface ReturnsOpts<T> {
  /**
   * Status to return on a successful execution.
   */
  status: number;
  /**
   * Schema to validate the response against.
   */
  schema?: JsonSchema<T>;
  /**
   * The description of the response to use in the generated Open API schema.
   */
  description?: string;
  /**
   * The `Content-Type` header of the response to use in the generated Open API
   * schema. Defaults to `application-json`.
   */
  contentType?: string;
  /**
   * Store the schema in the components section of the generated Open API schema.
   * Use this option if this response is used in many endpoints.
   */
  storeAsComponent?: false | string;
}

/**
 * Represents a 200 OK response.
 * @param schema Schema for the generated Open API schema and to validate the
 * response against.
 * @param opts Additional options.
 */
export function Ok<T>(
  schema: JsonSchema<T>,
  opts: Pick<
    ReturnsOpts<T>,
    'description' | 'contentType' | 'storeAsComponent'
  > = {}
) {
  return {
    status: 200,
    description: 'Successful operation',
    ...opts,
    schema,
  };
}

/**
 * Represents a 201 Created response.
 * @param schema Schema for the generated Open API schema and to validate the
 * response against.
 * @param opts Additional options.
 */
export function Created<T>(
  schema: JsonSchema<T>,
  opts: Pick<
    ReturnsOpts<T>,
    'description' | 'contentType' | 'storeAsComponent'
  > = {}
) {
  return {
    status: 201,
    description: 'Resource created',
    ...opts,
    schema,
  };
}

/**
 * Represents a 204 No Content response.
 * @param opts Additional options.
 */
export function NoContent<T>(opts: Pick<ReturnsOpts<T>, 'description'>) {
  return {
    status: 204,
    description: 'No content',
    ...opts,
  };
}

/**
 * Enforces the enpoint to return the specified response. On development it will
 * validate the response against the passed JSON schema and log warnings if not
 * valid.
 *
 * The response needs to be assigned to `ctx.state.returns` rather than
 * `ctx.body`.
 * @param opts Options to configure the middleware.
 */
export function returns<T>(opts: ReturnsOpts<T>): Middleware<{ returns: T }> {
  opts = {
    contentType: 'application/json',
    storeAsComponent: false,
    ...opts,
  };
  return withMetadata(
    async (ctx, next) => {
      await next();
      if (opts.schema && dev) {
        const result = validate(opts.schema, ctx.state.returns);
        if (!result.valid) {
          console.warn(
            `The response is not valid according to the schema. ${result.errors}`
          );
        }
      }
      ctx.status = opts.status;
      if (ctx.state.returns) {
        ctx.body = ctx.state.returns;
      }
    },
    combineMetadata(
      opts.storeAsComponent
        ? addResponseComponent(opts.storeAsComponent, <any>opts.schema)
        : () => {},
      addOperationResponse('' + opts.status, {
        description: opts.description!,
        content: {
          [opts.contentType!]: {
            schema: opts.storeAsComponent
              ? { $ref: `#/components/responses/${opts.storeAsComponent}` }
              : <any>opts.schema,
          },
        },
      })
    )
  );
}
