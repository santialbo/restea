import { Middleware } from 'koa';
import { ErrorResponse } from '../errors';
import { ResponseObject } from '../open-api';
import { JsonSchema } from '../json-schema';
import {
  addOperationResponse,
  addResponseComponent,
  addSchemaComponent,
  combineMetadata,
  withMetadata,
} from '../open-api';
import { noop } from './noop';

export interface ThrowsOpts {
  /**
   * HTTP code of the generated response.
   */
  status: number;
  /**
   * Readable code identifying the error.
   */
  code: string;
  /**
   * Description of the error.
   */
  description: string;
}

const schema: JsonSchema<{ error: ErrorResponse }> = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['status', 'code', 'message'],
      properties: {
        status: { type: 'integer' },
        code: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};

/**
 * Adds a response to the generated Open API schema.
 * @param opts Configuration options.
 */
export function throws(opts: ThrowsOpts): Middleware<{}, {}> {
  const response: ResponseObject = {
    description: opts.description,
    content: {
      'application/json': {
        schema: {
          $ref: `#/components/schemas/Error`,
        },
        example: {
          error: {
            status: opts.status,
            code: opts.code,
            message: 'This is a description of the error.',
          },
        },
      },
    },
  };
  return withMetadata(
    noop,
    combineMetadata(
      addSchemaComponent('Error', schema),
      addResponseComponent(opts.code, response),
      addOperationResponse('' + opts.status, {
        $ref: `#/components/responses/${opts.code}`,
      })
    )
  );
}
