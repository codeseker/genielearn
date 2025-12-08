import { Router } from "express";
import { index } from "../controllers/module";
import { courseIdValidation } from "../validations/course";

const router = Router();

router.route("/:courseId/all").get(courseIdValidation, index);

export default router;
