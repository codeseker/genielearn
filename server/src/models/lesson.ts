import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILesson extends Document {
  title: string;
  // this will be storing markdown string that can be too long, make a good type for this
  content: mongoose.Schema.Types.Mixed;
  module: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const lessonSchema: Schema<ILesson> = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true , default: ""},
    module: { type: mongoose.Types.ObjectId, ref: "Module", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const lesson: Model<ILesson> = mongoose.model<ILesson>("Lesson", lessonSchema);

export default lesson;
