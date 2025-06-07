import express, { Request, RequestHandler, RequestParamHandler } from 'express';
import {
	create,
	deleteIncome,
	finds,
	handleExportIncomePDF,
	update,
} from '../../controller/income/income.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/create', authenticateToken, create);
router.get('/find', authenticateToken, finds);
router.put('/update', authenticateToken, update);
router.delete('/remove', authenticateToken, deleteIncome);
/**
 * @swagger
 * /income/export:
 *   get:
 *     summary: Export incomes as a PDF
 *     description: Generates and downloads a PDF report of user incomes based on filters.
 *     tags:
 *       - Incomes
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user whose incomes are being exported
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by income source
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         required: false
 *         description: Minimum income amount
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         required: false
 *         description: Maximum income amount
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: Returns a PDF file of filtered incomes
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/export', authenticateToken, handleExportIncomePDF);

export default router;
