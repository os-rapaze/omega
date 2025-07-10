import { Schema, model } from 'mongoose';

const workspaceSchema = new Schema({
  nomeWorkspace: { type: String, required: true },
  descricaoWorkspace: { type: String }
});

export default model('Workspace', workspaceSchema);
