import {Router} from 'express';
const router = Router();
import authRouter from './auth';
import courseRouter from './course';
import moduleRouter from './module';
import lessonRouter from './lesson';
import { authMiddleware } from '../middlewares/auth';

router.use('/auth', authRouter);
router.use('/course', authMiddleware, courseRouter);
router.use('/module', authMiddleware, moduleRouter);
router.use("/lesson", authMiddleware, lessonRouter);

export default router;