import { Schema, model, Document, Types } from 'mongoose';

export interface ICollaborator {
  user: Types.ObjectId;
  role: 'editor' | 'viewer';
}

export interface IProject extends Document {
  name: string;
  owner: Types.ObjectId;
  collaborators: ICollaborator[];
  createdAt: Date;
  updatedAt: Date;
}

const CollaboratorSchema = new Schema<ICollaborator>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: {
    type: String,
    enum: ['editor', 'viewer'],
    required: true,
  },
}, { _id: false });

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true, trim: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [CollaboratorSchema],
}, { timestamps: true });

const Project = model<IProject>('Project', ProjectSchema);

export default Project;
