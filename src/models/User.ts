import { Schema, model, Document } from 'mongoose';

export interface UserProps extends Document {
  username: string;
  name: string;
  password: string;
  picture: string;
  status: 'ONLINE' | 'ABSENT' | 'OFFLINE';
}

const userSchema = new Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  picture: String,
  status: {
    type: String,
    enum: ['ONLINE', 'ABSENT', 'OFFLINE'],
    default: 'OFFLINE',
  },
}, { timestamps: true });

const User = model<UserProps>('User', userSchema, 'users');

export default User;
