import { Schema, model, Document } from 'mongoose';

interface MessageProps extends Document {
  from: number;
  to: number;
  text: string;
}

const messageSchema = new Schema({
  from: { type: Schema.Types.ObjectId, required: true },
  to: { type: Schema.Types.ObjectId, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const Message = model<MessageProps>('Message', messageSchema, 'messages');

export default Message;
