import express from 'express';
import {
	create,
	deleteSaving,
	finds,
} from '../../controller/saving/saving.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/create', authenticateToken, create);
router.get('/find/:userId', authenticateToken, finds);
//update
router.delete('/remove/:savingId', authenticateToken, deleteSaving);

export default router;
