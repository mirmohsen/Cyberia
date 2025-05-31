import express from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { create, finds } from '../../controller/expense/expense.controller';
import { update } from '../../controller/expense/expense.controller';

const router = express.Router();

router.post('/create', authenticateToken, create);
router.get('/find', authenticateToken, finds);
router.put('/update', authenticateToken, update);

export default router;
