import mongoose from 'mongoose';

const { Schema } = mongoose;

export const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  password: String,
});

export default mongoose.model('User', userSchema);
