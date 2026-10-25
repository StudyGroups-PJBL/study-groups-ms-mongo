import mongoose, { Schema, Document } from 'mongoose';
import { MessageType } from '../../domain/entities/GroupMessage';

export interface IGroupMessageDocument extends Document<string> {
  _id: string;
  groupId: string;
  authorName: string;
  content: string;
  type: MessageType;
  createdAt: Date;
}

const GroupMessageSchema = new Schema<IGroupMessageDocument>(
  {
    _id: { type: String, required: true },
    groupId: { type: String, required: true, index: true },
    authorName: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    type: { type: String, enum: ['USER', 'SYSTEM_EVENT'], required: true, default: 'USER' },
    createdAt: { type: Date, required: true, default: Date.now }
  },
  {
    versionKey: false,
    _id: false
  }
);

export const GroupMessageModel =
  mongoose.models.GroupMessage ||
  mongoose.model<IGroupMessageDocument>('GroupMessage', GroupMessageSchema, 'group_messages');
