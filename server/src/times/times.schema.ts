import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';

export type TimeDocument = HydratedDocument<Time>;

@Schema()
export class Time {
  @Prop({ maxlength: 255 })
  name: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Projeto' })
  projetoId: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
    default: [],
  })
  members: (Types.ObjectId | User)[];
}

export const TimeSchema = SchemaFactory.createForClass(Time);
