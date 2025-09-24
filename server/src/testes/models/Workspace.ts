import { Schema, model } from 'mongoose';

const workspaceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String }
});

export default model('Workspace', workspaceSchema);
