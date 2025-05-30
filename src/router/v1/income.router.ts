import express, { Request, RequestHandler, RequestParamHandler } from 'express';
import { create } from '../../controller/income/income.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/create', authenticateToken, create);

export default router;
