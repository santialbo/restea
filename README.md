# restea
**restea** is a collection of several middleware functions that can be composed in order to validate incoming (and outgoing) data in a declarative and documenting way. **retea** is built to be used with [TypeScript](https://github.com/microsoft/TypeScript) and [koa](https://github.com/koajs/koa) with [@koa/router](https://github.com/koajs/router).

These middleware, not only do the validation but they also provide types inside the handler function. See example below:

```ts
router.get(
  '/users',
  compose(
    description('Fetch a paginated list of users.'),
    paginated(),
    sortable({ fields: ['id', 'name'], default: '+id' }),
    query('role', string('none', 'admin'), {
      description: 'If provided will filter users based on this role',
    }),
    returns(Ok(ArrayOfSchema(UserSchema)))
  ),
  (ctx, next) => {
    const {
      offset, // `number`
      limit,  // `number`
      sort,   // `Sorting<'id' | 'name'>`
      role,   // `'none' | 'admin'`
    } = ctx.state.params;
    ...
  }
);
```

## How to use
### Installation
```
npm install restea
```
or
```
yarn add restea
```
### List of middleware
* `query`: Use it to validate/parse query parameters. See example:
  
  ```ts
  import { query, regex } from 'restea';
  ...
  router.get('/post', query('slug', regex(/^[a-z0-9-]+$/), async (ctx, next) => {
    return await controller.loadPost(ctx.state.params.slug);
  })
  ```
* `parameter`: Use it to validate/parse path parameters. See example:
  
  ```ts
  import { query, uuid } from 'restea';
  ...
  router.get('/post/:postId', query('slug', uuid()), async (ctx, next) => {
    return await controller.loadPost(ctx.state.params.postId);
  })
  ```
* `body`: Use it to validate/parse the incoming body of the request:
  
  ```ts
  import { query, uuid } from 'restea';
  ...
  interface CreatePost {
    title: string;
    content: string;
  }
  const CreatePostSchema: JsonSchema<CreatePost> = {
    type: 'object',
    required: ['title'],
    properties: {
      title: {
        type: 'string',
        maxLength: 255
      },
      content: {
        type: 'string'
      }
    }
  };
  router.post('/post/', body({ schema: CreatePostSchema }), async (ctx, next) => {
    return await controller.createPost(ctx.state.body); // ctx.state.body is `CreatePost`
  })
  ```
