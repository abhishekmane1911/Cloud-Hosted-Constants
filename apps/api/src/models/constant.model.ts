import { Schema, model, Document, Types } from 'mongoose';

// Interface for a single historical version of a constant
export interface IConstantVersion {
  value: any;
  updatedBy: Types.ObjectId;
  updatedAt: Date;
}

// Interface for the Constant document
export interface IConstant extends Document {
  project: Types.ObjectId;
  key: string;
  value: any;
  environment: 'development' | 'staging' | 'production';
  tags: string[];
  history: IConstantVersion[];
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}

const ConstantVersionSchema = new Schema<IConstantVersion>({
  value: { type: Schema.Types.Mixed, required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date, required: true },
}, { _id: false });

const ConstantSchema = new Schema<IConstant>({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  key: { type: String, required: true, trim: true },
  value: { type: Schema.Types.Mixed, required: true },
  environment: {
    type: String,
    enum: ['development', 'staging', 'production'],
    required: true,
  },
  tags: [{ type: String, trim: true }],
  history: [ConstantVersionSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Add a compound index to ensure a key is unique per project and environment
ConstantSchema.index({ project: 1, key: 1, environment: 1 }, { unique: true });

// Middleware to add to history before saving a change
ConstantSchema.pre('save', function (next) {
    if (this.isModified('value')) {
        // 'this' refers to the document being saved.
        // We need a way to access the original document to push it to history.
        // A common approach is to use a query middleware (`pre('findOneAndUpdate')`)
        // or to handle this logic in the service layer where we have both old and new values.
        // For simplicity here, we'll assume the service layer handles adding to history.
    }
    next();
});


const Constant = model<IConstant>('Constant', ConstantSchema);

export default Constant;
