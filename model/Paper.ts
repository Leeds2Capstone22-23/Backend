import mongoose from 'mongoose';

const { Schema } = mongoose;

export const paperSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  isPrivate: Boolean,
  title: String,
  text: String,
  tags: [
    {
      tag: { type: Schema.Types.ObjectId, ref: 'Tag' },
      color: Number,
      locations: [{
        startIndex: Number,
        endIndex: Number,
      }],
    },
  ],
});

export default mongoose.model('Paper', paperSchema);
