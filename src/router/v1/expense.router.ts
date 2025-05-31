import express from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { create } from '../../controller/income/expense.controller';

const router = express.Router();

router.post('/create', authenticateToken, create);

export default router;
