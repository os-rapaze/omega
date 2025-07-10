import { Schema, model, Types } from 'mongoose';

const tarefasUsuarioSchema = new Schema({
  tarefaId: { type: Types.ObjectId, ref: 'Tarefas', required: true },
  usuarioId: { type: Types.ObjectId, ref: 'Usuarios', required: true }
});

tarefasUsuarioSchema.index({ tarefaId: 1, usuarioId: 1 }, { unique: true });

export default model('tarefaUsuario', tarefasUsuarioSchema);
