import { Schema, model } from 'mongoose';

const projetosSchema = new Schema({
  name: { type: String, maxlength: 255 },
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },

  github: {
    owner: { type: String },
    repo: { type: String },
    connected: { type: Boolean, default: false },
    accessToken: { type: String },
  },
});

export default model('Projeto', projetosSchema);
