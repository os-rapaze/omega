import { Schema, model } from 'mongoose';

const comumLingSchema = new Schema({
  nomeComumLinguagem: { type: String, maxlength: 255}
});

export default model('ComumLinguagem', comumLingSchema);
