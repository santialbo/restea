import { ValidationError } from './ValidationError';
import { ParameterValidator } from './ParameterValidator';

/**
 * Returns a regex validator.
 * @param regex The regex to validate against.
 */
export function regex(regex: RegExp): ParameterValidator<string, string>;
/**
 * Returns a regex validator.
 * @param regex The regex to validate against.
 * @param mapper On a successful match, will map the value of the parameter
 * using this function
 */
export function regex<T>(
  regex: RegExp,
  mapper: (value: string) => T
): ParameterValidator<T, string>;
export function regex(
  regex: RegExp,
  mapper?: (value: string) => any
): ParameterValidator<any> {
  return {
    get type() {
      return `/${regex.source}/`;
    },
    validate(value) {
      if (regex.test(value)) {
        return mapper ? mapper(value) : value;
      }
      throw new ValidationError(
        `Expected a string matching /${regex.source}/ but received: '${value}' `
      );
    },
    schema: {
      type: 'string',
      pattern: regex.source,
    },
  };
}
