import Ajv from 'ajv';
import { JSONSchema7 } from 'json-schema';

/**
 * Interface for a JSON Schema v7.
 */
export type JsonSchema<T = any> = Omit<JSONSchema7 & { _unused: T }, '_unused'>;
// Trick the typescript compiler to make Schema generic.

/**
 * Represents a schema validation result.
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string };

/**
 * Validates a value against the specified schema.
 * @param schema Schema to validate against.
 * @param value The value to validate.
 */
export function validate(schema: JsonSchema, value: any): ValidationResult {
  const ajv = new Ajv();
  const valid = ajv.validate(schema, value) as boolean;
  if (valid) {
    return { valid };
  } else {
    return {
      valid,
      errors: ajv.errorsText(),
    };
  }
}
