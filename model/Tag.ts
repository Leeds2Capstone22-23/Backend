import mongoose from 'mongoose';

const { Schema } = mongoose;

export const tagSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  isPrivate: Boolean,
  name: String,
});

export default mongoose.model('Tag', tagSchema);
