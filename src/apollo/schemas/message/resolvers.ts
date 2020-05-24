import { IResolvers, withFilter } from 'apollo-server-express';
import { Context, ConnectionContext } from '../../../types/system';

import Message from '../../../models/Message';

const CHAT_MESSAGE = 'CHAT_MESSAGE';

const resolvers: IResolvers<undefined, Context> = {
  Query: {
    async messages(obj, { userId }, { user }) {
      try {
        const messages = await Message.find({
          $or: [
            { from: user.id, to: userId },
            { from: userId, to: user.id },
          ],
        });
        return messages;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },

  Mutation: {
    async sendMessage(obj, { userId, text }, { user, pubsub }) {
      try {
        const chatMessage = await Message.create({
          from: user.id,
          to: userId,
          text,
        });

        pubsub.publish(CHAT_MESSAGE, { chatMessage });

        return chatMessage;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },

  Subscription: {
    chatMessage: {
      subscribe: withFilter(
        (obj, args, { pubsub }) => pubsub.asyncIterator([CHAT_MESSAGE]),
        ({ chatMessage }, { userId }, { user: { id } }: ConnectionContext) => {
          const from = chatMessage.from.toString();
          const to = chatMessage.to.toString();

          return (from === userId && to === id) || (from === id && to === userId);
        },
      ),
    },
  },
};

export default resolvers;
