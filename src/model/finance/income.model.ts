import { ObjectId, Schema, Types, model } from 'mongoose';
import { FilterQuery } from 'mongoose';
import { CreateIncomeDto } from '../../dto/income.dto';

const IncomeSchema = new Schema(
	{
		user: {
			required: true,
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		amount: Number,
		source: String,
		date: Date,
		//category
		note: String,
	},
	{ timestamps: true }
);

const incomeModel = model('Income', IncomeSchema);

export async function createIncome(createIncome: CreateIncomeDto) {
	const create = await incomeModel.create(createIncome);
	return create.populate('user');
}

export async function findIncomes(
	userId: string,
	page = 1,
	limit = 10,
	filters?: {
		source?: string;
		minAmount?: number;
		maxAmount?: number;
	}
) {
	try {
		const objectUserId = new Types.ObjectId(userId);

		const query: any = {
			user: objectUserId,
		};

		if (filters?.source) {
			query.source = filters.source;
		}

		if (filters?.minAmount || filters?.maxAmount) {
			query.amount = {};
			if (filters.minAmount !== undefined) {
				query.amount.$gte = filters.minAmount;
			}
			if (filters.maxAmount !== undefined) {
				query.amount.$lte = filters.maxAmount;
			}
		}

		const skip = (page - 1) * limit;

		const [total, data] = await Promise.all([
			incomeModel.countDocuments(query),
			incomeModel.find(query).skip(skip).limit(limit).populate('user'),
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
