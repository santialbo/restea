import { ParameterValidator } from './ParameterValidator';
import { ValidationError } from './ValidationError';

export function arrayOf<T>(
  validator: ParameterValidator<T>
): ParameterValidator<T[], string> {
  return {
    get type() {
      return `Array<${validator.type}>`;
    },
    async validate(value) {
      if (value === '') {
        return [];
      }
      const result: T[] = [];
      for (let term of value.split(/\s*(?<!\\),\s*/)) {
        term = term.replace(/\\,/g, ','); // Unescape commas
        term = term.trim();
        try {
          result.push(await validator.validate(term));
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new ValidationError(
              `Expected array of ${validator.type} but received: ${value}. ${error.message}`
            );
          } else {
            throw error;
          }
        }
      }
      return result;
    },
    schema: {
      type: 'string',
      description: 'Comma-separated list.',
    },
  };
}
