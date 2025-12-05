import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  tags: string[];
  level: string;
  targetAudience: string[];
  estimatedDuration: string;
  prerequisites: string[];
  intentCategory: string;
}

const courseSchema: Schema<ICourse> = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    level: { type: String, required: false },
    targetAudience: { type: [String], required: false },
    estimatedDuration: { type: String, required: false },
    prerequisites: { type: [String], default: [] },
    intentCategory: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

courseSchema.set("toObject", {
  virtuals: true,
});

courseSchema.virtual("modules", {
  ref: "Module",
  localField: "_id",
  foreignField: "course",
});

const course: Model<ICourse> = mongoose.model<ICourse>("Course", courseSchema);

export default course;
