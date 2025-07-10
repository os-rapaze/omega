import { Schema, model } from 'mongoose';

const permissionSchema = new Schema({
  descricaoPermissao: { type: String, maxlength: 255 }
});

export default model('Permissoes', permissionSchema);
