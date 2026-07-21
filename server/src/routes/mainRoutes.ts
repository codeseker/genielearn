import { Router } from "express";
const router = Router();
import authRouter from "./auth";
import courseRouter from "./course";
import moduleRouter from "./module";
import lessonRouter from "./lesson";
import youtubeRouter from "./youtube";
import { authMiddleware } from "../middlewares/auth";
import userRouter from "./user";
import pdfRouter from "./pdf";

router.use("/auth", authRouter);
router.use("/course", authMiddleware, courseRouter);
router.use("/module", authMiddleware, moduleRouter);
router.use("/lesson", authMiddleware, lessonRouter);
router.use("/youtube", youtubeRouter);
router.use("/user", authMiddleware, userRouter);
router.use("/pdf", pdfRouter);

export default router;
