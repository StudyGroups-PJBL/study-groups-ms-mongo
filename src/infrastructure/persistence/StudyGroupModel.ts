import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyGroupDocument extends Document<string> {
  _id: string;
  name: string;
  subject: string;
  description: string;
  membersCount: number;
  createdAt: Date;
}

const StudyGroupSchema = new Schema<IStudyGroupDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true, minlength: 3 },
    subject: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    membersCount: { type: Number, required: true, min: 1, default: 1 },
    createdAt: { type: Date, required: true, default: Date.now }
  },
  {
    versionKey: false,
    _id: false
  }
);

export const StudyGroupModel =
  mongoose.models.StudyGroup ||
  mongoose.model<IStudyGroupDocument>('StudyGroup', StudyGroupSchema, 'study_groups');
