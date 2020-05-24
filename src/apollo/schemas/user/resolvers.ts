import {
  IResolvers, AuthenticationError, withFilter,
} from 'apollo-server-express';
import path from 'path';
import { createWriteStream, unlinkSync } from 'fs';
import bcrypt from 'bcrypt';
import { Context, ConnectionContext } from '../../../types/system';

import User from '../../../models/User';
import FriendRequest from '../../../models/FriendRequest';
import createToken from '../../../utils/createToken';

export const USER_STATUS = 'USER_STATUS';

const resolvers: IResolvers<undefined, Context> = {
  Query: {
    currentUser: async (obj, args, { user }) => user,

    user: async (obj, { userId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User Not Found');

      return user;
    },

    hello: async () => {
      const users = await User.find().populate('friends');
      return users;
    },

    searchUsers: async (obj, { name }, { user }) => {
      const data = await User.find({
        _id: { $nin: [user.id] },
        name: { $regex: `.*${name}.*`, $options: 'i' },
      }).limit(8);

      const users = await Promise.all(data.map(async (us) => {
        const request = await FriendRequest.findOne({
          $or: [
            { from: user.id, to: us.id },
            { from: us.id, to: user.id },
          ],
        });

        return {
          ...us.toObject(),
          id: us.id,
          requestId: request?.id || null,
          isFriends: request?.accepted || false,
        };
      }));

      return users;
    },
  },

  Mutation: {
    login: async (obj, { username, password }) => {
      try {
        const user = await User.findOne({ username });

        if (!user || !(user && (await bcrypt.compare(password, user.password)))) {
          throw new AuthenticationError('Username or password incorrect.');
        }

        const token = createToken(user.id);

        user.status = 'ONLINE';
        user.save();

        return { token, user };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    register: async (obj, { user }) => {
      try {
        const { username, name, password } = user;

        const usernameExist = await User.findOne({ username });

        if (usernameExist) { throw new Error('Username already exist.'); }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
          username,
          password: hashedPassword,
          name,
        });

        return 'User created!';
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    setUserPicture: async (obg, { file }, { user }) => {
      try {
        if (!file) throw new Error('File required!');

        const { filename, mimetype, createReadStream } = await file;

        const allowedMimes = ['image/jpeg', 'image/jpeg', 'image/png'];
        if (!allowedMimes.includes(mimetype)) {
          throw new Error('Invalid format file');
        }

        const newFileName = `${Date.now().toString()}${Math.ceil(Math.random() * 500)}_${filename}`;

        const filePath = path.join(__dirname, '..', '..', '..', '..', 'temp');
        await new Promise((res) => createReadStream()
          .pipe(createWriteStream(path.join(filePath, newFileName)))
          .on('close', res));

        if (user.picture) {
          unlinkSync(path.join(filePath, user.picture));
        }

        const currentUser = user;
        currentUser.picture = newFileName;
        await currentUser.save();

        return true;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },


    setUserStatus: async (obj, { status }, { user, pubsub }) => {
      const currentUser = user;
      currentUser.status = status;

      await currentUser.save();

      pubsub.publish(USER_STATUS, {
        userStatus: {
          id: currentUser.id,
          status: currentUser.status,
        },
      });

      return null;
    },
  },

  Subscription: {
    userStatus: {
      subscribe: withFilter(
        (obj, args, { pubsub }) => pubsub.asyncIterator([USER_STATUS]),
        async ({ userStatus }, args, { user }: ConnectionContext) => {
          const isFriends = await FriendRequest.countDocuments({
            $or: [
              { from: user.id, to: userStatus.id },
              { from: userStatus.id, to: user.id },
            ],
            accepted: true,
          }) > 0;

          return userStatus.id === user.id || isFriends;
        },
      ),
    },
  },
};

export default resolvers;
