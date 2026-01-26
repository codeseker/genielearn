import mongoose from "mongoose";
import { getDbUri } from "./db-config";

const connectDB = async () => {
  const uri = getDbUri();
  return mongoose.connect(uri);
};

export { connectDB };
