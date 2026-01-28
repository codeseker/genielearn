import { Router } from "express";
import {
  login,
  logout,
  refreshToken,
  register,
  socialLoginGoogle,
} from "../controllers/auth";
import { loginValidation, registerValidation } from "../validations/auth";
import { authMiddleware } from "../middlewares/auth";
const router = Router();

router.route("/register").post(registerValidation, register);
router.route("/login").post(loginValidation, login);
router.route("/logout").post(authMiddleware, logout);
router.route("/refresh").post(refreshToken);
router.route("/social-login/google").post(socialLoginGoogle);

export default router;
