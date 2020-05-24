import { makeExecutableSchema } from 'apollo-server-express';

import AuthDirective from '../directives/AuthDirective';
import user from './user';
import message from './message';
import friendRequest from './friendRequest';

const schemas = [
  user,
  message,
  friendRequest,
];

const typeDefs = schemas.map((schema) => schema.typeDefs);

const resolvers = schemas.map((schema) => schema.resolvers);

const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    auth: AuthDirective,
  },
});

export default executableSchema;
