import express from 'express';
import {
	create,
	deleteSaving,
	finds,
	update,
} from '../../controller/saving/saving.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/create', authenticateToken, create);
router.get('/find/:userId', authenticateToken, finds);
router.put('/update', authenticateToken, update);
router.delete('/remove/:savingId', authenticateToken, deleteSaving);

export default router;
