import { Schema, model } from 'mongoose';

const permissionSchema = new Schema({
  description: { type: String, maxlength: 255 }
});

export default model('Permissoes', permissionSchema);
