import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILesson extends Document {
  title: string;
  content: mongoose.Schema.Types.Mixed;
  module: mongoose.Types.ObjectId;
  isDeleted: boolean;
  order: number;
  description: string;
  estimatedMinutes: number;
}

const lessonSchema: Schema<ILesson> = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed, default: "" },
    module: { type: mongoose.Types.ObjectId, ref: "Module", required: true },
    isDeleted: { type: Boolean, default: false },
    order: { type: Number, required: false },
    description: { type: String, required: false },
    estimatedMinutes: { type: Number, required: false },
  },
  {
    timestamps: true,
  }
);

const lesson: Model<ILesson> = mongoose.model<ILesson>("Lesson", lessonSchema);

export default lesson;
