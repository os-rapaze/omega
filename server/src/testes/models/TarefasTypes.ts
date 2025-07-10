import { Schema, model } from 'mongoose';

const tarefasTypeSchema = new Schema ({
    descricaoTarefaType: {type: String, maxlength:255}
});

export default model('tarefasType', tarefasTypeSchema);
