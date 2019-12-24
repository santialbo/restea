import { JsonSchema } from '../json-schema';

/**
 * Validator object used for parameter validation Open API schema generation.
 */
export interface ParameterValidator<TOutput, TSchema = any> {
  /**
   * Type description
   */
  readonly type: string;

  /**
   * JSON schema used for describing the parameter.
   */
  readonly schema: JsonSchema<TSchema>;

  /**
   * Validates the input and returns a clean value.
   * @param value The parameter value
   */
  validate(value: string): TOutput | Promise<TOutput>;
}
