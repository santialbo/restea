import { Middleware } from 'koa';
import { InvalidRequestBodyError } from '../errors';
import { JsonSchema, validate } from '../json-schema';
import {
  addOperationRequestBody,
  addRequestBodyComponent,
  combineMetadata,
  withMetadata,
} from '../open-api';
import { compose } from './compose';
import { throws } from './throws';

export interface BodyOpts<T, U> {
  schema: JsonSchema<T>;
  description?: string;
  contentType?: string;
  storeAsComponent?: false | string;
  mapper?: (body: T) => U;
}

/**
 * Validates that the body of the inconming request against the specified
 * schema.
 * @param opts Configuration options.
 */
export function body<T, U = T>(opts: BodyOpts<T, U>) {
  opts = {
    contentType: 'application/json',
    storeAsComponent: false,
    ...opts,
  };
  return compose(
    withMetadata<Middleware<{ body: U }>>(
      async (ctx, next) => {
        const body = ctx.request.body;
        const result = validate(opts.schema, body);
        if (!result.valid) {
          throw new InvalidRequestBodyError(result.errors);
        } else {
          ctx.state.body = opts.mapper ? opts.mapper(body) : body;
        }
        await next();
      },
      combineMetadata(
        opts.storeAsComponent
          ? addRequestBodyComponent(opts.storeAsComponent, <any>opts.schema)
          : () => {},
        addOperationRequestBody({
          description: opts.description!,
          content: {
            [opts.contentType!]: {
              schema: opts.storeAsComponent
                ? {
                    $ref: `#/components/requestBodies/${opts.storeAsComponent}`,
                  }
                : <any>opts.schema,
            },
          },
        })
      )
    ),
    throws(InvalidRequestBodyError)
  );
}
