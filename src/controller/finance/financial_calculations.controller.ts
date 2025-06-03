import { NextFunction, Request, Response } from 'express';
import {
	incomeModel,
	MonthlyIncomeSum,
} from '../../model/finance/income.model';
import {
	expenseModel,
	MonthlyExpenseSum,
} from '../../model/finance/expense.model';
import dayjs from 'dayjs';
import { savingModel } from '../../model/finance/saving.model';
import { error } from 'console';

/**
 * @openapi
 * /finance/balance:
 *   get:
 *     summary: Get financial summary (income, expense, and balance) for a given month
 *     tags:
 *       - Finance
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Month to summarize, in YYYY-MM-DD format (e.g. 2025-06-01)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly finance summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 month:
 *                   type: string
 *                   example: "2025-06"
 *                 totalIncome:
 *                   type: number
 *                   example: 5000
 *                 totalExpense:
 *                   type: number
 *                   example: 2750
 *                 balance:
 *                   type: number
 *                   example: 2250
 *       400:
 *         description: Missing or invalid month parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Month is required in query string (e.g. ?month=2025-06-01)"
 *       401:
 *         description: Unauthorized request (user not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: user not found in request"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
export const finance = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { month } = req.query;
		const userId = (req as any).user?.id;

		if (!userId) {
			res
				.status(401)
				.json({ message: 'Unauthorized: user not found in request' });
			return;
		}

		if (!month) {
			res.status(400).json({
				message: 'Month is required in query string (e.g. ?month=2025-06-01)',
			});
			return;
		}

		const date = new Date(month as string);
		if (isNaN(date.getTime())) {
			res.status(400).json({ message: 'Invalid date format' });
			return;
		}

		const totalIncome = await MonthlyIncomeSum(userId, date);
		const totalExpense = await MonthlyExpenseSum(userId, date);
		const balance = totalIncome - totalExpense;

		res.status(200).json({
			month: date.toISOString().substring(0, 7),
			totalIncome,
			totalExpense,
			balance,
		});
	} catch (error) {
		console.error('Error in finance controller:', error);
		res.status(500).json({ message: 'Internal server error' });
		next(error);
	}
};

/**
 * @openapi
 * /finance/summary:
 *   get:
 *     summary: Get financial summary (income, expenses, net balance, and savings) for a given period
 *     tags:
 *       - Finance
 *     parameters:
 *       - in: query
 *         name: month
 *         required: false
 *         schema:
 *           type: string
 *           example: "2025-06"
 *         description: Month in YYYY-MM format. If provided, overrides from/to dates.
 *       - in: query
 *         name: from
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-06-01"
 *         description: Start date for the summary period (ignored if 'month' is provided).
 *       - in: query
 *         name: to
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-06-30"
 *         description: End date for the summary period (ignored if 'month' is provided).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-01T00:00:00.000Z"
 *                     to:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-30T23:59:59.999Z"
 *                 totalIncome:
 *                   type: number
 *                   example: 8000
 *                 totalExpenses:
 *                   type: number
 *                   example: 6200
 *                 netBalance:
 *                   type: number
 *                   example: 1800
 *                 savings:
 *                   type: object
 *                   properties:
 *                     totalContributed:
 *                       type: number
 *                       example: 2500
 *                     goals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Emergency Fund"
 *                           targetAmount:
 *                             type: number
 *                             example: 5000
 *                           currentAmount:
 *                             type: number
 *                             example: 1250
 *                           progressPercent:
 *                             type: number
 *                             format: float
 *                             example: 25.0
 *       401:
 *         description: Unauthorized access (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: user not found in request"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving financial summary"
 */

export const getFinancialSummary = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = (req as any).user?.id;
		const { month, from: fromQuery, to: toQuery } = req.query;

		let from: Date;
		let to: Date;

		if (month) {
			from = dayjs(`${month}-01`).startOf('month').toDate();
			to = dayjs(`${month}-01`).endOf('month').toDate();
		} else {
			from = fromQuery
				? new Date(fromQuery as string)
				: dayjs().startOf('month').toDate();
			to = toQuery
				? new Date(toQuery as string)
				: dayjs().endOf('month').toDate();
		}

		const incomes = await incomeModel.find({
			user: userId,
			date: { $gte: from, $lte: to },
		});
		const totalIncome = incomes.reduce(
			(sum, inc) => sum + (inc.amount ?? 0),
			0
		);

		const expenses = await expenseModel.find({
			user: userId,
			date: { $gte: from, $lte: to },
		});
		const totalExpenses = expenses.reduce(
			(sum, exp) => sum + (exp.amount ?? 0),
			0
		);

		const savings = await savingModel.find({ user: userId });
		const goals = savings.map((goal) => {
			const progress =
				(goal.targetAmount ?? 0) > 0
					? (goal.currentAmount ?? 0 / (goal.targetAmount ?? 0)) * 100
					: 0;
			return {
				title: goal.title,
				targetAmount: goal.targetAmount,
				currentAmount: goal.currentAmount,
				progressPercent: +progress.toFixed(2),
			};
		});

		const totalContributed = savings.reduce(
			(sum, s) => sum + (s.currentAmount ?? 0),
			0
		);

		res.json({
			period: {
				from,
				to,
			},
			totalIncome,
			totalExpenses,
			netBalance: totalIncome - totalExpenses,
			savings: {
				totalContributed,
				goals,
			},
		});
		return;
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Error retrieving financial summary' });
		next(error);
	}
};
