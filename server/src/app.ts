import "dotenv/config";
import express, { Application } from "express";
import { connectDB } from "./db/db";
import { errorHandler } from "./middlewares/error-handler";
import router from "./routes/mainRoutes";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import path from "path";

const app: Application = express();

const PORT: number = parseInt(process.env.PORT || "8000", 10);
const APP_MODE: string = process.env.APP_MODE || "development";

// Middlewares
app.use(cookieParser());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL_LOCAL as string,
      process.env.FRONTEND_URL_PROD as string,
    ],
    credentials: true,
  }),
);
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
  }),
);
app.use(express.json());

// Routes
app.use("/api/v1", (req, res, next) => {
  const start = Date.now();

  console.log(`➡️  ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `⬅️  ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );
  });

  next();
});

app.use("/api/v1", router);

// Error Handling Middleware
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("Connected TO DB: ✅");
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`APP MODE: ${APP_MODE}`);
    });
  } catch (error: unknown) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
