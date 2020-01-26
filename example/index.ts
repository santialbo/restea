import cors from '@koa/cors';
import Router from '@koa/router';
import {
  arrayOf,
  body,
  compose,
  Created,
  description,
  errorHandler,
  NotFoundError,
  Ok,
  paginated,
  parameter,
  query,
  returns,
  serveSchema,
  sortable,
  string,
  throws,
  uuid,
} from 'restea';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { v4 } from 'uuid';
import { CreateUserSchema, UserSchema, ArrayOfSchema } from './models';

const port = parseInt(process.env.PORT || '3000', 10);
// const dev = process.env.NODE_ENV !== 'production';

const server = new Koa();

server.use(errorHandler());
server.use(cors());
server.use(bodyParser());

const router = new Router<{}>();

router.get(
  '/users',
  compose(
    description('Fetch a paginated list of users.'),
    paginated(),
    sortable({ fields: ['id', 'name'], default: '+id' }),
    query('role', string('none', 'admin'), {
      description: 'If provided will filter users based on this role',
      required: true
    }),
    query('maybeRole', string('none', 'admin'), {
      description: 'If provided will filter users based on this role',
    }),
    returns(Ok(ArrayOfSchema(UserSchema)))
  ),
  (ctx, next) => {
    const { offset, limit, sort, role, maybeRole } = ctx.state.params;
    ctx.state.returns = [];
  }
);

router.get(
  '/users/:userId',
  compose(
    description('Fetch user by ID.'),
    parameter('userId', uuid(), { description: 'The ID of the user.' }),
    throws(NotFoundError),
    returns(Ok(UserSchema))
  ),
  (ctx, next) => {
    const { userId } = ctx.state.params;
    ctx.state.returns = {
      id: userId,
      firstName: 'Morty',
      lastName: 'Smith',
      email: 'morty@c137.com',
      createdAt: new Date().toISOString(),
    };
  }
);

router.post(
  '/users',
  compose(
    description('Create user.'),
    body({ schema: CreateUserSchema, description: 'The user to be created' }),
    returns(Created(UserSchema))
  ),
  (ctx, next) => {
    ctx.state.returns = {
      id: v4(),
      firstName: '',
      lastName: '',
      ...ctx.state.body,
      createdAt: new Date().toISOString(),
    };
  }
);

router.get(
  '/schema',
  serveSchema(router, {
    info: { title: 'restea API', version: '1.0.0' },
  })
);

server.use(router.routes());

server.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
