import { Router } from "express";
import { index } from "../controllers/module";

const router = Router();

router.route("/:courseId/all").get(index);

export default router;