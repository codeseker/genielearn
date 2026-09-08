import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'roles',
})
export class Role {
  _id: any;

  @Prop({
    required: true,
    trim: true,
    unique: true,
    type: String,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
    type: String,
  })
  description: string;

  @Prop({
    required: true,
    trim: true,
    type: Boolean,
  })
  isSystem: boolean;
}

export type RoleDocument = HydratedDocument<Role>;
export const RoleSchema = SchemaFactory.createForClass(Role);