import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type UploadOwnerType = "USER" | "COURSE" | "LESSON" | "OTHER";
export type UploadFileType = "IMAGE" | "VIDEO" | "DOCUMENT" | "OTHER";

export interface IUpload extends Document {
  url: string;
  key?: string;
  mimeType?: string;
  size?: number;
  originalName: string;
  fileType: UploadFileType;

  ownerType: UploadOwnerType;
  owner: Types.ObjectId;

  isPublic: boolean;
  uploadedBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const uploadSchema = new Schema<IUpload>(
  {
    url: { type: String, required: true },
    key: { type: String },

    mimeType: { type: String, required: false, default: null },
    size: { type: Number, required: false, default: null },
    originalName: { type: String, required: true },

    fileType: {
      type: String,
      enum: ["IMAGE", "VIDEO", "DOCUMENT", "OTHER"],
      required: true,
    },

    ownerType: {
      type: String,
      enum: ["USER", "COURSE", "LESSON", "OTHER"],
      required: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "ownerType",
    },

    isPublic: { type: Boolean, default: true },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Upload: Model<IUpload> = mongoose.model<IUpload>("Upload", uploadSchema);

export default Upload;
