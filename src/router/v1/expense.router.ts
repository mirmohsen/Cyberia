import express from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import {
	create,
	finds,
	update,
	deleteExpense,
	handleExportExpensePDF,
} from '../../controller/expense/expense.controller';

const router = express.Router();

router.post('/create', authenticateToken, create);
router.get('/find', authenticateToken, finds);
router.put('/update', authenticateToken, update);
router.delete('/remove', authenticateToken, deleteExpense);
/**
 * @swagger
 * /expense/export:
 *   get:
 *     summary: Export expenses as a PDF
 *     description: Generates and downloads a PDF report of user expenses based on optional filters.
 *     tags:
 *       - Expenses
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user whose expenses are being exported
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         required: false
 *         description: Minimum expense amount
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         required: false
 *         description: Maximum expense amount
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
 *         description: Returns a PDF file of filtered expenses
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
 *                   example: Invalid user ID
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get('/export', authenticateToken, handleExportExpensePDF);

export default router;
