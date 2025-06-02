import express from 'express';
import authRouter from './auth.router';
import incomeRouter from './income.router';
import expenseRouter from './expense.router';
import savingRouter from './saving.router';
import financialCalculations from './financial_calculations.router';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/income', incomeRouter);
router.use('/expense', expenseRouter);
router.use('/saving', savingRouter);
router.use('/finance', financialCalculations);

export default router;
