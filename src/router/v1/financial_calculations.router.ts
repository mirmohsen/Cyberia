import express from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import {
	finance,
	getFinancialSummary,
} from '../../controller/finance/financial_calculations.controller';

const router = express.Router();

router.get('/balance', authenticateToken, finance);
router.get('/summary', authenticateToken, getFinancialSummary);

export default router;
