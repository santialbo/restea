import { parseISO } from 'date-fns';
import { ValidationError } from './ValidationError';
import { ParameterValidator } from './ParameterValidator';

/**
 * Returns a validator for ISO dates.
 */
export function date(): ParameterValidator<Date, string> {
  return {
    get type() {
      return 'Date';
    },
    validate(value) {
      const result = parseISO(value);
      if (isNaN(result.getTime())) {
        throw new ValidationError(
          `Expected a valid ISO 8601 date but received: '${value}'`
        );
      }
      return result;
    },
    schema: {
      type: 'string',
      format: 'date-time',
      description:
        'An [ISO 8601 date](https://en.wikipedia.org/wiki/ISO_8601).',
    },
  };
}
