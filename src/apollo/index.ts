import {
  AuthenticationError,
  ApolloServerExpressConfig,
  PubSub,
} from 'apollo-server-express';

import schema from './schemas';
import User, { UserProps } from '../models/User';
import decodeToken from '../utils/decodeToken';
import { USER_STATUS } from './schemas/user/resolvers';

interface ConnectParams {
  headers: {
    authorization: string;
  }
}

const pubsub = new PubSub();

const apolloServerConfig: ApolloServerExpressConfig = {
  schema,
  uploads: {
    maxFileSize: 1024 * 1024 * 3,
    maxFiles: 1,
  },
  context: ({ req, res, connection }) => {
    if (!req && connection) {
      return { pubsub, ...connection.context };
    }

    return { req, res, pubsub };
  },
  subscriptions: {
    async onConnect(params: ConnectParams) {
      const { authorization } = params.headers;
      const decoded = await decodeToken(authorization);

      const user = await User.findById(decoded.id);
      if (!user) throw new AuthenticationError('User not found');

      user.status = 'ONLINE';
      user.save();

      setTimeout(() => pubsub.publish(USER_STATUS, {
        userStatus: {
          id: user.id,
          status: user.status,
        },
      }), 1000);

      return { user };
    },
    async onDisconnect(websocket, context) {
      const { user }: { user: UserProps } = await context.initPromise;

      user.status = 'OFFLINE';
      user.save();

      pubsub.publish(USER_STATUS, {
        userStatus: {
          id: user.id,
          status: user.status,
        },
      });
    },
  },
};

export default apolloServerConfig;
