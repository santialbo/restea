import { compose } from './compose';
import { query } from './query';
import { integer } from '../validators';

export interface PaginatedDefaults {
  /**
   * The default limit, when a value is not provided.
   */
  limit?: number;
}

/**
 * Parses and validates `offset` and `limit` parameters.
 * @param opts Options for the pagination.
 */
export function paginated(opts: PaginatedDefaults = {}) {
  opts = {
    limit: 10,
    ...opts,
  };
  return compose(
    query('offset', integer({ min: 0 }), {
      default: 0,
      description: 'How many items to return at most.',
      storeAsComponent: true,
    }),
    query('limit', integer({ min: 0 }), {
      default: opts.limit!,
      description: 'How many items to skip.',
      storeAsComponent: true,
    })
  );
}
