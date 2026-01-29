import mongoose, { Schema, Document, Model } from "mongoose";
import { generateUniqueSlug } from "../utils/helper-function";

export interface IModule extends Document {
  title: string;
  slug: string;
  description: string;
  course: mongoose.Types.ObjectId;
  order: number;
  isDeleted: boolean;
  isCompleted: boolean;
}

const moduleSchema: Schema<IModule> = new Schema<IModule>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: false },
    course: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
    order: { type: Number, required: false },
    isDeleted: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

moduleSchema.pre<IModule>("validate", async function (next) {
  if (!this.isModified("title")) return;

  const Model = this.constructor as Model<IModule>;

  this.slug = await generateUniqueSlug({
    model: Model,
    title: this.title,
    id: this._id.toString(),
  });
});

moduleSchema.virtual("lessons", {
  ref: "Lesson",
  localField: "_id",
  foreignField: "module",
});

const moduleModel: Model<IModule> = mongoose.model<IModule>(
  "Module",
  moduleSchema,
);

export default moduleModel;
