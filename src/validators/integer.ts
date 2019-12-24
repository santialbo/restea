import validator from 'validator';
import { ParameterValidator } from './ParameterValidator';
import { ValidationError } from './ValidationError';
import { JsonSchema } from '../json-schema';

interface IntegerOptions {
  /**
   * Minimum value allowed.
   */
  min?: number;
  /**
   * Maximum value allowed.
   */
  max?: number;
}

/**
 * Returns an integer validator.
 * @param opts Configuration options.
 */
export function integer(opts: IntegerOptions = {}): ParameterValidator<number> {
  const schema: JsonSchema<number> = { type: 'integer' };
  if ('min' in opts) {
    schema.minimum = opts.min;
  }
  if ('max' in opts) {
    schema.maximum = opts.max;
  }
  return {
    get type() {
      return 'integer';
    },
    validate(value) {
      if (validator.isInt(value, { ...opts, allow_leading_zeroes: false })) {
        return parseInt(value, 10);
      }
      throw new ValidationError(`Expected an integer but received: '${value}'`);
    },
    schema,
  };
}
