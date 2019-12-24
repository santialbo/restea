import {
  BaseParameterObject,
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  ReferenceObject,
  ResponseObject,
  RequestBodyObject,
} from './spec';
import { JsonSchema } from '../json-schema';

export const META = Symbol('Meta');

export type MetadataBuilder = (definitions: {
  api: OpenAPIObject;
  path: string;
  item: PathItemObject;
  operation: OperationObject;
}) => void;

export type WithMetadata<T> = T & {
  [META]?: MetadataBuilder;
};

/**
 * Attaches some metadata to the value.
 */
export function withMetadata<T>(
  value: T,
  metadata: MetadataBuilder
): WithMetadata<T> {
  return Object.assign(value, { [META]: metadata });
}

/**
 * Combines several metadata builders into a single one.
 * @param values The metadata builders.
 */
export function combineMetadata(...values: MetadataBuilder[]): MetadataBuilder {
  return defs => {
    for (const meta of values) {
      meta(defs);
    }
  };
}

/**
 * Adds a parameter to the component collection.
 * @param name Name of the parameter.
 * @param parameter Parameter specification.
 */
export function addParameterComponent(
  name: string,
  parameter: ParameterObject
): MetadataBuilder {
  return defs => {
    defs.api.components!.parameters![name] = parameter;
  };
}

/**
 * Adds a response to the component collection.
 * @param name Name of the response.
 * @param parameter Response specification.
 */
export function addResponseComponent(
  name: string,
  response: ResponseObject
): MetadataBuilder {
  return defs => {
    defs.api.components!.responses![name] = response;
  };
}

/**
 * Adds a schema to the component collection.
 * @param name Name of the schema.
 * @param parameter Schema specification.
 */
export function addSchemaComponent(
  name: string,
  schema: JsonSchema
): MetadataBuilder {
  return defs => {
    defs.api.components!.schemas![name] = schema;
  };
}

/**
 * Adds a RequestBody to the component collection.
 * @param name Name of the RequestBody.
 * @param parameter RequestBody specification.
 */
export function addRequestBodyComponent(
  name: string,
  body: RequestBodyObject
): MetadataBuilder {
  return defs => {
    defs.api.components!.requestBodies![name] = body;
  };
}

/**
 * Adds a parameter to the current operation.
 * @param parameters Parameters speficication.
 */
export function addOperationParameter(
  parameter: ParameterObject | ReferenceObject
): MetadataBuilder {
  return defs => {
    defs.operation.parameters = defs.operation.parameters ?? [];
    defs.operation.parameters!.push(parameter);
  };
}

/**
 * Updates the current operation with the specified data.
 * @param data Operation specification.
 */
export function updateOperation(
  data: Partial<OperationObject>
): MetadataBuilder {
  return defs => {
    Object.assign(defs.operation, data);
  };
}

/**
 * Updates the specified path parameter.
 * @param name Name of the parameter.
 * @param data Parameter specification.
 */
export function updatePathParameter(
  name: string,
  data: BaseParameterObject
): MetadataBuilder {
  return defs => {
    for (const param of defs.item.parameters!) {
      if ('name' in param && param.name === name) {
        Object.assign(param, data);
      }
    }
  };
}

/**
 * Adds a response to the current operation.
 * @param code Code of the response.
 * @param response Specification of the response.
 */
export function addOperationResponse(
  code: string,
  response: ResponseObject | ReferenceObject
): MetadataBuilder {
  return defs => {
    defs.operation.responses[code] = response;
  };
}

/**
 * Adds a RequestBody to the current operation.
 * @param requestBody Specification of the RequestBody.
 */
export function addOperationRequestBody(
  requestBody: RequestBodyObject | ReferenceObject
): MetadataBuilder {
  return defs => {
    defs.operation.requestBody = requestBody;
  };
}
