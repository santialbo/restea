import validator from 'validator';
import { ParameterValidator } from './ParameterValidator';
import { ValidationError } from './ValidationError';

/**
 * Returns a UUID validator.
 */
export function uuid(): ParameterValidator<string> {
  return {
    get type() {
      return 'UUID';
    },
    validate(value) {
      if (validator.isUUID(value)) {
        return value.toLowerCase();
      }
      throw new ValidationError(
        `Expected a valid RFC 4122 UUID but received: '${value}'`
      );
    },
    schema: {
      type: 'string',
      format: 'uuid',
      description: 'A valid RFC 4122 UUID.',
    },
  };
}
