import mongoose, { Schema, Document, Model } from "mongoose";

export interface IModule extends Document {
  title: string;
  description: string;
  course: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const moduleSchema: Schema<IModule> = new Schema<IModule>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    course: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

moduleSchema.virtual("lessons", {
  ref: "Lesson",
  localField: "_id",
  foreignField: "module",
});

const moduleModel: Model<IModule> = mongoose.model<IModule>(
  "Module",
  moduleSchema
);

export default moduleModel;
