import express from 'express';
import authRouter from './auth.router';
import incomeRouter from './income.router';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/income', incomeRouter);

export default router;
