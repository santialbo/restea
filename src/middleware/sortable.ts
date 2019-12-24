import outdent from 'outdent';
import { ValidationError, ParameterValidator, arrayOf } from '../validators';
import { compose } from './compose';
import { query } from './query';

export interface Sorting<T extends string> {
  field: T;
  direction: '+' | '-';
}

const FIELD_REGEX = /^\w+(\.\w+)*$/;

function parse<T extends string>(value: string, fields: T[]): Sorting<T> {
  const [, dir, field] = value.match(/^([+-])?([\w\.]+)$/)!;
  if (fields.includes(field as any)) {
    return { field: field as T, direction: (dir as '+' | '-') ?? '+' };
  } else {
    throw new Error('Invalid field');
  }
}

function validator<T extends string>(
  fields: T[]
): ParameterValidator<Sorting<T>> {
  return {
    type: `Sorting<${fields.map(f => `'${f}'`).join('|')}>`,
    validate: value => {
      try {
        return parse(value, fields);
      } catch {
        throw new ValidationError(
          `'${value}' is not a valid field. Options are: ${fields
            .map(f => `'${f}'`)
            .join(', ')}.`
        );
      }
    },
    schema: {},
  };
}

/**
 * Options for the sortable middleware.
 */
export interface SortableOptions<T> {
  /**
   * List of fields available for sorting.
   */
  fields: T[];
  /**
   * Default sorting to use when the `sort` parameter is not present.
   */
  default: string;
}

/**
 * Parses and validates the `sort` parameter using the following convention:
 * ```
 * <Sorting>[,<Sorting>]*
 * where
 * <Sorting> = [+|-]?<field>
 * ```
 * @param opts Configuration options.
 */
export function sortable<T extends string>(opts: SortableOptions<T>) {
  for (const field of opts.fields) {
    if (!FIELD_REGEX.test(field)) {
      throw new Error(`Invalid field name '${field}' in sortable middleware`);
    }
  }
  return compose(
    query('sort', arrayOf(validator(opts.fields)), {
      default: [parse(opts.default, opts.fields)],
      description: outdent`
        Comma-separated list of fields to sort the results by.

        Format:
        \`\`\`
        <Sorting>[,<Sorting>]*
        where
        <Sorting> = [+|-]?<field>
        \`\`\`
        
        Fields: ${opts.fields.map(f => `\`${f}\``).join(', ')}`,
    })
  );
}
