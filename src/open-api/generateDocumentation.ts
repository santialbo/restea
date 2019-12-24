import Router from '@koa/router';
import merge from 'deepmerge';
import { parse } from 'path-to-regexp';
import { OpenAPIObject, OperationObject, PathItemObject } from './spec';
import { MetadataBuilder, META } from './metadata';

/**
 * Transforms a path using the colon syntax for parameters to one using the
 * brace syntax.
 * @param path Path using the colon syntax for paramters (e.g. /users/:userId).
 */
function normalizePath(path: string) {
  return parse(path)
    .map(t => (typeof t === 'string' ? t : `/{${t.name}}`))
    .join('');
}

/**
 * Goes through the specified router definition gathering all of the metadata
 * and generates the Open API schema specification.
 * @param router The Koa router to read the metadata from.
 * @param options Initial Open API object to start from.
 */
export function generateDocumentation(
  router: Router,
  options: Partial<OpenAPIObject>
) {
  const api: OpenAPIObject = merge(
    {
      openapi: '3.0.0',
      info: {
        title: 'API',
        version: '1.0.0',
      },
      paths: {},
      components: {
        schemas: {},
        responses: {},
        parameters: {},
        examples: {},
        requestBodies: {},
        headers: {},
        securitySchemes: {},
        links: {},
        callbacks: {},
      },
      tags: [],
      servers: [],
    },
    options
  );
  const paths = new Map<string, PathItemObject>();
  for (const layer of router.stack) {
    const path = normalizePath(layer.path);
    const { name, opts, paramNames, stack, methods } = layer;
    if (opts.end) {
      const item: PathItemObject = paths.get(path) ?? {
        parameters: paramNames.map(({ name }) => ({
          in: 'path',
          name,
          required: true,
          schema: {
            type: 'string',
          },
        })),
      };
      const operation: OperationObject = { responses: {} };
      if (name) {
        operation.operationId = name;
      }
      for (const middleware of stack) {
        if (META in middleware) {
          (<MetadataBuilder>middleware[META])({
            api,
            path,
            operation,
            item,
          });
        }
      }
      for (const method of methods) {
        if (method === 'HEAD') continue;
        item[method.toLowerCase()] = operation;
      }
      paths.set(path, item);
    }
  }
  for (const [path, item] of paths.entries()) {
    api.paths[path] = item;
  }
  return api;
}
