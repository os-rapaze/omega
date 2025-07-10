import {Schema, model,Types} from 'mongoose';

const projetosSchema = new Schema ({
    nomeProjeto: {type: String, maxlength:255},
    workspaceId: {type: Schema.Types.ObjectId, ref:'workspace'}
});

export default model ('projetos', projetosSchema);