import { Router } from "express";
import { generatePdf } from "../controllers/pdf";

const router = Router();

router.route("/generate").post(generatePdf);

export default router;
