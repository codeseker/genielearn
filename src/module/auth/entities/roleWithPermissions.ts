import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({
  collection: 'role_permissions',
})
export class RoleWithPermissions {
  _id: any;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Role',
  })
  roleId: Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Permission',
  })
  permissionId: Types.ObjectId;
}

export type RoleWithPermissionsDocument = HydratedDocument<RoleWithPermissions>;
export const RoleWithPermissionsSchema = SchemaFactory.createForClass(RoleWithPermissions);
RoleWithPermissionsSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });
