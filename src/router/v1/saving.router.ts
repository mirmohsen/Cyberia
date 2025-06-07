import express from 'express';
import {
	create,
	deleteSaving,
	exportSavingReport,
	finds,
	update,
} from '../../controller/saving/saving.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/create', authenticateToken, create);
router.get('/find/:userId', authenticateToken, finds);
router.put('/update', authenticateToken, update);
router.delete('/remove/:savingId', authenticateToken, deleteSaving);
/**
 * @swagger
 * /saving/export:
 *   get:
 *     summary: Export savings report as PDF
 *     description: Generates a PDF file for the user's savings with optional filters such as title, target/current amount range, and deadline range.
 *     tags:
 *       - Savings
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose savings are being exported.
 *       - in: query
 *         name: title
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by saving title.
 *       - in: query
 *         name: minTargetAmount
 *         required: false
 *         schema:
 *           type: number
 *         description: Minimum target amount.
 *       - in: query
 *         name: maxTargetAmount
 *         required: false
 *         schema:
 *           type: number
 *         description: Maximum target amount.
 *       - in: query
 *         name: minCurrentAmount
 *         required: false
 *         schema:
 *           type: number
 *         description: Minimum current saved amount.
 *       - in: query
 *         name: maxCurrentAmount
 *         required: false
 *         schema:
 *           type: number
 *         description: Maximum current saved amount.
 *       - in: query
 *         name: startDeadline
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start of deadline date filter.
 *       - in: query
 *         name: endDeadline
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End of deadline date filter.
 *     responses:
 *       200:
 *         description: PDF file of filtered savings
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Missing userId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing userId
 *       500:
 *         description: Failed to export saving report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to export saving report
 */
router.get('/export', authenticateToken, exportSavingReport);

export default router;
