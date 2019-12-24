import { ParameterValidator } from './ParameterValidator';
import { ValidationError } from './ValidationError';
import { JsonSchema } from '../json-schema';

type PV<T> = ParameterValidator<T>;

export function oneOf<T1>(...vs: [PV<T1>]): PV<T1>;
export function oneOf<T1, T2>(...vs: [PV<T1>, PV<T2>]): PV<T1 | T2>;
export function oneOf<T1, T2, T3>(
  ...vs: [PV<T1>, PV<T2>, PV<T3>]
): PV<T1 | T2 | T3>;
/**
 * Creates the union from the provided validators. The returned validator will
 * succeed if one of the provided validators succeeds.
 * @param vs validators to combine
 */
export function oneOf(...validators: PV<any>[]): PV<any> {
  const schema: JsonSchema = {
    type: undefined,
    oneOf: validators.map(({ schema }) => schema),
  };
  return {
    get type() {
      return validators.map(v => v.type).join(' | ');
    },
    async validate(value) {
      for (const validator of validators) {
        try {
          return await validator.validate(value);
        } catch {}
      }
      throw new ValidationError(
        `Expected ${this.type} but received: '${value}'`
      );
    },
    schema,
  };
}
