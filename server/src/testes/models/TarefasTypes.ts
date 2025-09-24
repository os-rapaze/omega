import { Schema, model } from 'mongoose';

const tarefasTypeSchema = new Schema ({
    description: {type: String, maxlength:255}
});

export default model('tarefasType', tarefasTypeSchema);
