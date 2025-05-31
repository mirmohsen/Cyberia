import express, { Request, RequestHandler, RequestParamHandler } from 'express';
import {
	create,
	deleteIncome,
	finds,
	update,
} from '../../controller/income/income.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/create', authenticateToken, create);
router.get('/find', authenticateToken, finds);
router.put('/update', authenticateToken, update);
router.delete('/remove', authenticateToken, deleteIncome);

export default router;
