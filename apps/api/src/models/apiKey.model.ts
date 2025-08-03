import { Schema, model, Document, Types } from 'mongoose';
import crypto from 'crypto';

export interface IAPIKey extends Document {
  key: string;
  project: Types.ObjectId;
  user: Types.ObjectId; // The user who created the key
  expiresAt?: Date;
  lastUsedAt?: Date;
  compareKey(candidateKey: string): boolean;
}

const APIKeySchema = new Schema<IAPIKey>({
  key: {
    type: String,
    required: true,
    unique: true,
    // The actual key is only stored as a hash
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
  },
  lastUsedAt: {
    type: Date,
  },
}, { timestamps: true });

// Method to compare a candidate key with the stored hash
APIKeySchema.methods.compareKey = function (candidateKey: string): boolean {
  // We will hash the candidate key and compare it with the stored hash.
  // The key itself is not stored in plain text.
  // This is a placeholder for the actual hashing logic.
  // For now, we will do a simple comparison.
  // In a real implementation, we would use a secure hash like SHA256.
  const hash = crypto.createHash('sha256').update(candidateKey).digest('hex');
  return this.key === hash;
};

// We will not store the raw API key. Instead, we'll store a hash.
// The raw key is only shown to the user once upon creation.
// When a request comes in with an API key, we hash it and look for a match in the database.
// This is more secure than storing the keys in plain text.

const APIKey = model<IAPIKey>('APIKey', APIKeySchema);

export default APIKey;
