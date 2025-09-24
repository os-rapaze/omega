import {Schema, model, Types} from 'mongoose';

const tarefasSchema = new Schema ({
    keyTarefa: {type: String, length: 6},
    name: {type: String, maxlength: 64},
    description: {type: String, maxlength: 255},
    tarefaTypeId: {type: Types.ObjectId, ref: 'tarefasTypes'},
    projetoId: {type: Types.ObjectId, ref: 'projetos'}
});

export default model('tarefas', tarefasSchema);
