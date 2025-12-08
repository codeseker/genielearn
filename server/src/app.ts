import "dotenv/config";
import express, { Application } from "express";
import { connectDB } from "./db/db";
import { errorHandler } from "./middlewares/error-handler";
import router from "./routes/mainRoutes";
import cors from "cors";
import cookieParser from "cookie-parser";

const app: Application = express();


const PORT: number = parseInt(process.env.PORT || "8000", 10);
const NODE_ENV: string = process.env.NODE_ENV || "development";

// Middlewares
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:4173"],
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/v1", router);

// Error Handling Middleware
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    const MONGO_URI: string =
      NODE_ENV === "production"
        ? (process.env.MONGO_URI_PROD as string)
        : (process.env.MONGO_URI_LOCAL as string);

    if (!MONGO_URI) {
      throw new Error("MongoDB connection string is missing.");
    }

    await connectDB(MONGO_URI);

    app.listen(PORT, () => {
      console.log("Connected TO DB: ✅");
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
    });
  } catch (error: unknown) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};


startServer();
