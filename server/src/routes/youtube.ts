import express from "express";
import { fetchVideos } from "../controllers/youtube";

const router = express.Router();

router.get("/videos", fetchVideos);

export default router;
