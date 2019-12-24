import { JsonSchema } from 'restea';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export const UserSchema: JsonSchema<User> = {
  type: 'object',
  required: ['id', 'email', 'firstName', 'lastName', 'createdAt'],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
    email: {
      type: 'string',
      format: 'email',
    },
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
  },
};

export interface CreateUser {
  email: string;
  firstName?: string;
  lastName?: string;
}

export function ArrayOfSchema<T>(schema: JsonSchema<T>): JsonSchema<T[]> {
  return {
    type: 'array',
    items: schema,
  };
}

export const CreateUserSchema: JsonSchema<User> = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
  },
};
