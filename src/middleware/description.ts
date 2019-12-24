import { Middleware } from 'koa';
import { withMetadata, updateOperation } from '../open-api';
import { noop } from './noop';

/**
 * Adds a description to the generated Open API schema for this operation.
 * @param value The description for the endpoint.
 */
export function description(value: string): Middleware {
  return withMetadata(noop, updateOperation({ description: value }));
}
