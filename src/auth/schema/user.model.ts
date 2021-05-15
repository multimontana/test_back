import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = User & Document;
mongoose.set('useCreateIndex', true);
@Schema()
export class User {
  @Prop()
  name: string;

  @Prop({ type: String, unique: true, required: true })
  email: string;

  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
