import express from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import {
	create,
	finds,
	update,
	deleteExpense,
} from '../../controller/expense/expense.controller';

const router = express.Router();

router.post('/create', authenticateToken, create);
router.get('/find', authenticateToken, finds);
router.put('/update', authenticateToken, update);
router.delete('/remove', authenticateToken, deleteExpense);

export default router;
