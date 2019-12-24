import { ValidationError } from '../validators';

export interface ErrorResponse {
  status: number;
  code: string;
  message: string;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    public message: string
  ) {
    super(message);
  }
  toResponse(): ErrorResponse {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
    };
  }
}

export class InvalidParameterError extends HttpError {
  static status = 422;
  static code = 'InvalidParameter';
  static description =
    'One of the parameters is invalid. See message for more information.';
  constructor(
    public name: string,
    public location: 'query' | 'path',
    public error: ValidationError
  ) {
    super(
      InvalidParameterError.status,
      InvalidParameterError.code,
      `Invalid ${location} parameter '${name}'. ${error.message}`
    );
  }
}

export class InvalidRequestBodyError extends HttpError {
  static status = 422;
  static code = 'InvalidRequestBody';
  static description =
    'The body of the request is invalid. See message for more information.';
  constructor(errors: string) {
    super(
      InvalidRequestBodyError.status,
      InvalidRequestBodyError.code,
      `Invalid request body. ${errors}`
    );
  }
}

export class NotFoundError extends HttpError {
  static status = 404;
  static code = 'NotFound';
  static description = 'The resource has not been found.';
  constructor(errors: string) {
    super(
      NotFoundError.status,
      NotFoundError.code,
      `The resource has not been found`
    );
  }
}
