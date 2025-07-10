import {Schema, model, Types} from 'mongoose';

const workspaceUsuarioPermissoesSchema = new Schema ({
    usuarioId: {type: Types.ObjectId, ref:'Usarios'},
    workspaceId: {type: Types.ObjectId, ref:'workspace'},
    projetoId: {type: Types.ObjectId, ref:'Projetos'},
    permissoesId: {type: Types.ObjectId, ref:'Permissoes'}
});

workspaceUsuarioPermissoesSchema.index(
  { usuarioId: 1, workspaceId: 1, projetoId: 1 },
  { unique: true }
);

export default model('WorkspaceUsuariosPermissoes', workspaceUsuarioPermissoesSchema);