import { Schema, model, Document } from 'mongoose';
import { UserProps } from './User';

type ObjectId = Schema.Types.ObjectId;

interface FriendRequestProps extends Document {
  from: UserProps | ObjectId;
  to: UserProps | ObjectId;
  accepted: boolean;
}

const friendRequestSchema = new Schema({
  from: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  to: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  accepted: { type: Boolean, required: true, default: false },
}, { timestamps: true });

const FriendRequest = model<FriendRequestProps>('FriendRequest', friendRequestSchema, 'friendRequests');

export default FriendRequest;
