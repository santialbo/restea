# restea
**restea** is a collection of several middleware functions that can be composed in order to validate incoming (and outgoing) data in a declarative and documenting way. **retea** is built to be used with [TypeScript](https://github.com/microsoft/TypeScript) and [koa](https://github.com/koajs/koa).

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
