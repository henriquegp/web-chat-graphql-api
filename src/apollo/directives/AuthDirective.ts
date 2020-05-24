/* eslint-disable class-methods-use-this */
import { SchemaDirectiveVisitor, AuthenticationError } from 'apollo-server-express';
import { GraphQLField, defaultFieldResolver } from 'graphql';

import User from '../../models/User';
import decodeToken from '../../utils/decodeToken';
import { Context } from '../../types/system';

class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(f: GraphQLField<undefined, Context>) {
    const field = f;
    const { resolve = defaultFieldResolver } = field;

    field.resolve = async function setResolve(obj, args, context, info) {
      const { authorization } = context.req.headers;

      const decoded = await decodeToken(authorization);

      const user = await User.findById(decoded.id);
      if (!user) throw new AuthenticationError('User not found');

      const newContext = {
        ...context,
        user,
      };

      return resolve.apply(this, [obj, args, newContext, info]);
    };
  }
}

export default AuthDirective;
