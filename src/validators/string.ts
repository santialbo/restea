import { ValidationError } from './ValidationError';
import { ParameterValidator } from './ParameterValidator';

/**
 * Returns a validator that will succeed if the parameter value matches with one
 * of the provided values.
 * @param values Valid values for the parameter
 */
export function string<T extends string>(
  ...values: T[]
): ParameterValidator<T, string> {
  const { caseSensitive } = {
    caseSensitive: false,
  };
  return {
    get type() {
      return values.map(opt => `'${opt}'`).join(' | ');
    },
    validate(value) {
      const match = values.find(v => {
        return caseSensitive
          ? v === value
          : v.toLowerCase() === value.toLowerCase();
      });
      if (match) {
        return match as T;
      }
      throw new ValidationError(
        `Expected ${this.type} but received: '${value}'`
      );
    },
    schema: {
      type: 'string',
      ...(values.length === 1 ? { const: values[0] } : { enum: values }),
    },
  };
}
