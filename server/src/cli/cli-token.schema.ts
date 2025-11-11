import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CliTokenDocument = HydratedDocument<CliToken>;

@Schema({ timestamps: true })
export class CliToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop({ default: false })
  revoked: boolean;
}

export const CliTokenSchema = SchemaFactory.createForClass(CliToken);
