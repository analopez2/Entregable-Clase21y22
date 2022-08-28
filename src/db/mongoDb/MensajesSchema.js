import mongoose from 'mongoose';

const MensajesSchema = new mongoose.Schema({
  author: { type: Object, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

export { MensajesSchema };
