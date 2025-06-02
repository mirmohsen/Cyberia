import mongoose, { Schema, Types, model } from 'mongoose';
import { CreateExpenseDto } from '../../dto/expense.dto';

const ExpenseSchema = new Schema(
	{
		user: {
			required: true,
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		amount: Number,
		description: String,
		date: Date,
		//category
		note: String,
	},
	{ timestamps: true }
);

export const expenseModel = model('Expense', ExpenseSchema);

export async function createExpense(createExpenseDto: CreateExpenseDto) {
	const create = await expenseModel.create(createExpenseDto);
	return create;
}

export async function findExpense(
	userId: string,
	page = 1,
	limit = 10,
	filters?: {
		minAmount?: number;
		maxAmount?: number;
		startDate?: Date | string;
		endDate?: Date | string;
	}
) {
	try {
		const objectUserId = new Types.ObjectId(userId);

		const query: any = {
			user: objectUserId,
		};

		if (filters?.minAmount || filters?.maxAmount) {
			query.amount = {};
			if (filters.minAmount !== undefined) {
				query.amount.$gte = filters.minAmount;
			}
			if (filters.maxAmount !== undefined) {
				query.amount.$lte = filters.maxAmount;
			}
		}

		if (filters?.startDate || filters?.endDate) {
			query.date = {};
			if (filters.startDate) {
				query.date.$gte = new Date(filters.startDate);
			}
			if (filters.endDate) {
				query.date.$lte = new Date(filters.endDate);
			}
		}

		const skip = (page - 1) * limit;

		const [total, data] = await Promise.all([
			expenseModel.countDocuments(query),
			expenseModel.find(query).skip(skip).limit(limit).populate('user'),
		]);

		return {
			total,
			page,
			limit,
			data,
		};
	} catch (error) {
		console.error('DB error in findIncomes:', error);
		throw error;
	}
}

export async function updateExpenseById(
	expenseId: string,
	updates: Partial<{
		user: string;
		amount: number;
		description: string;
		date: Date;
		note: string;
	}>
) {
	if (!Types.ObjectId.isValid(expenseId)) {
		throw new Error('Invalid expenseId');
	}

	if (updates.user && !Types.ObjectId.isValid(updates.user)) {
		throw new Error('Invalid user ID in updates');
	}

	const updatedExpense = await expenseModel
		.findByIdAndUpdate(
			expenseId,
			{ $set: updates },
			{ new: true, runValidators: true }
		)
		.populate('user');

	if (!updatedExpense) {
		throw new Error('expense not found or update failed');
	}

	return updatedExpense;
}

export async function deleteExpeneseById(expenseId: Types.ObjectId) {
	const result = await expenseModel.findByIdAndDelete(expenseId);

	if (!result) {
		throw new Error('Income not found');
	}
	return result;
}

export async function MonthlyExpenseSum(userId: string, month: Date) {
	const start = new Date(month.getFullYear(), month.getMonth(), 1);
	const end = new Date(month.getFullYear(), month.getMonth() + 1, 1);

	const result = await expenseModel.aggregate([
		{
			$match: {
				user: new mongoose.Types.ObjectId(userId),
				date: {
					$gte: start,
					$lt: end,
				},
			},
		},
		{
			$group: {
				_id: null,
				total: { $sum: '$amount' },
			},
		},
	]);

	return result[0]?.total || 0;
}