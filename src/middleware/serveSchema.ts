import Router from '@koa/router';
import { Middleware } from 'koa';
import { OpenAPIObject } from '../open-api';
import { withMetadata, updateOperation } from '../open-api';
import { generateDocumentation } from '../open-api';

/**
 * Returns a middleware that serves the generated Schema for the specified router.
 * @param router The Koa router to read the metadata from.
 * @param options Initial Open API object to start from.
 */
export function serveSchema(router: Router, options: Partial<OpenAPIObject>) {
  let _cached: OpenAPIObject;
  return withMetadata<Middleware<any, any>>(
    async (ctx, next) => {
      ctx.body = _cached || (_cached = generateDocumentation(router, options));
    },
    updateOperation({
      description: 'OpenAPI specification',
      responses: {
        '200': {
          description: 'OpenAPI specification',
          schema: {
            $ref:
              'https://rawgit.com/OAI/OpenAPI-Specification/master/schemas/v3.0/schema.json',
          },
        },
      },
    })
  );
}
