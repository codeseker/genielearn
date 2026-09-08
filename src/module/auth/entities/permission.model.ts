import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'permissions',
})
export class Permission {
  _id: any;

  @Prop({
    required: true,
    type: String,
    trim: true,
    unique: true,
  })
  key: string;

  @Prop({
    required: true,
    type: String,
    trim: true,
    index: true,
  })
  module: string;

  @Prop({
    required: true,
    type: String,
    trim: true,
    index: true,
  })
  action: string;

  @Prop({
    required: false,
    type: String,
    trim: true,
  })
  description?: string;
}

export type PermissionDocument = HydratedDocument<Permission>;
export const PermissionSchema = SchemaFactory.createForClass(Permission);
