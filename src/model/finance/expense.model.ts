import { Schema, Types, model } from 'mongoose';
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

const expenseModel = model('Expense', ExpenseSchema);

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
