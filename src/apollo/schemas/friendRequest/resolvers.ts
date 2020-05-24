import { IResolvers } from 'apollo-server-express';
import { Context } from '../../../types/system';

import User, { UserProps } from '../../../models/User';
import FriendRequest from '../../../models/FriendRequest';


const resolvers: IResolvers<undefined, Context> = {
  Query: {
    friends: async (obj, args, { user }) => {
      const data = await FriendRequest
        .find({
          $or: [
            { to: user.id },
            { from: user.id },
          ],
          accepted: true,
        })
        .populate('from')
        .populate('to');

      const friends = await Promise.all(data.map(async ({ from, to }) => {
        const friend = ((from as UserProps).id === user.id ? to : from) as UserProps;

        return friend;
      }));

      return friends;
    },

    friendRequests: async (obj, args, { user }) => {
      const requests = await FriendRequest.find({ to: user.id, accepted: false }).populate('from');
      return requests;
    },
  },

  Mutation: {
    friendRequest: async (obj, { userId }, { user }) => {
      try {
        const friend = await User.findById(userId);
        if (!friend || userId === user.id) { throw new Error('User not found.'); }

        const isRequested = await FriendRequest.findOne({
          $or: [
            { from: user.id, to: userId },
            { from: userId, to: user.id },
          ],
        });

        if (isRequested) {
          if (isRequested.accepted) { throw new Error('You are already friends.'); }
          throw new Error('Resquest already sent.');
        }

        const request = await FriendRequest.create({ from: user.id, to: userId });

        return !!request;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    acceptFriendRequest: async (obj, { requestId }, { user }) => {
      try {
        const request = await FriendRequest.findById(requestId);
        if (!request) { throw new Error('Friend request not found.'); }

        if (request.to.toString() !== user.id) { return false; }

        request.accepted = true;
        await request.save();

        return true;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    rejectFriendRequest: async (obj, { requestId }, { user }) => {
      try {
        const request = await FriendRequest.findOne({
          _id: requestId,
          $or: [
            { from: user.id },
            { to: user.id },
          ],
        });

        if (!request) { throw new Error('Friend request not found.'); }

        await request.remove();
        return true;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};

export default resolvers;
