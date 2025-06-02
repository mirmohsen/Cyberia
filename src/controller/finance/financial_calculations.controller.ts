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
