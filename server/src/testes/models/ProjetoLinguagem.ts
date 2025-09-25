import {Schema,model, Types} from 'mongoose';

const workSpaceLingSchema = new Schema ({
    tarefaType: {type: Types.ObjectId, ref:'tarefasTypes'},
    comumLingId: {type: Types.ObjectId, ref:'comumLinguagem'}
});

export default model('workspaceLinguagem', workSpaceLingSchema);