import { Schema, model } from 'mongoose';

const comumLingSchema = new Schema({
  name: { type: String, maxlength: 255}
});

export default model('ComumLinguagem', comumLingSchema);
