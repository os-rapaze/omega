import { Schema, model } from 'mongoose';

const usuarioSchema = new Schema({
  nomeUsuario: { type: String, maxlength: 255 },
  emailUsuario: { type: String, unique: true, maxlength: 255 },
  senhaUsuario: { type: String, minlength: 6 },
});

export default model('Usuario', usuarioSchema);
