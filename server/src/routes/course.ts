import { Router } from "express";
import {
  coursesWithStats,
  create,
  index,
  remove,
  show,
} from "../controllers/course";
import {
  courseIdValidation,
  createValidation,
  indexValidation,
} from "../validations/course";

const router = Router();

router.route("/all").get(indexValidation, index);
router.route("/create").post(createValidation, create);
router.route("/:courseId/view").get(courseIdValidation, show);
router.route("/:courseId/delete").delete(courseIdValidation, remove);
router.route("/stats").get(coursesWithStats);

export default router;
