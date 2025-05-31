import express from 'express';
import { create } from '../../controller/saving/saving.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/create', authenticateToken, create);

export default router;
