import mongoose, { ObjectId, Schema, Types, model } from 'mongoose';
import { CreateIncomeDto } from '../../dto/income.dto';
import PDFDocument from 'pdfkit';
import fs from 'fs';

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

export const incomeModel = model('Income', IncomeSchema);

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
		startDate?: Date | string;
		endDate?: Date | string;
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

export async function updateIncomeById(
	incomeId: string,
	updates: Partial<{
		user: string;
		amount: number;
		source: string;
		date: Date;
		note: string;
	}>
) {
	if (!Types.ObjectId.isValid(incomeId)) {
		throw new Error('Invalid incomeId');
	}

	if (updates.user && !Types.ObjectId.isValid(updates.user)) {
		throw new Error('Invalid user ID in updates');
	}

	const updatedIncome = await incomeModel
		.findByIdAndUpdate(
			incomeId,
			{ $set: updates },
			{ new: true, runValidators: true }
		)
		.populate('user');

	if (!updatedIncome) {
		throw new Error('Income not found or update failed');
	}

	return updatedIncome;
}

export async function deleteIncomeById(incomeId: Types.ObjectId) {
	const result = await incomeModel.findByIdAndDelete(incomeId);

	if (!result) {
		throw new Error('Income not found');
	}
	return result;
}

export async function MonthlyIncomeSum(userId: string, month: Date) {
	const start = new Date(month.getFullYear(), month.getMonth(), 1);
	const end = new Date(month.getFullYear(), month.getMonth() + 1, 1);

	const result = await incomeModel.aggregate([
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

export async function exportIncomesAsPDF(
	userId: string,
	filters?: {
		source?: string;
		minAmount?: number;
		maxAmount?: number;
		startDate?: Date | string;
		endDate?: Date | string;
	}
): Promise<Buffer> {
	const objectUserId = new Types.ObjectId(userId);

	const query: any = { user: objectUserId };

	if (filters?.source) query.source = filters.source;
	if (filters?.minAmount || filters?.maxAmount) {
		query.amount = {};
		if (filters.minAmount !== undefined) query.amount.$gte = filters.minAmount;
		if (filters.maxAmount !== undefined) query.amount.$lte = filters.maxAmount;
	}
	if (filters?.startDate || filters?.endDate) {
		query.date = {};
		if (filters.startDate) query.date.$gte = new Date(filters.startDate);
		if (filters.endDate) query.date.$lte = new Date(filters.endDate);
	}

	const incomes = await incomeModel.find(query).populate('user');

	const doc = new PDFDocument({ margin: 30 });
	const chunks: any[] = [];
	doc.on('data', (chunk) => chunks.push(chunk));
	doc.on('end', () => {});

	doc.fontSize(18).text('Income Report', { align: 'center' });
	doc.moveDown();

	// Table header
	doc.fontSize(12).text('Date', 50, doc.y, { continued: true });
	doc.text('Amount', 150, doc.y, { continued: true });
	doc.text('Source', 250, doc.y, { continued: true });
	doc.text('Note', 350, doc.y);
	doc.moveDown();

	// Table rows
	incomes.forEach((income) => {
		const date = income.date ? new Date(income.date).toLocaleDateString() : '-';
		doc.fontSize(10).text(date, 50, doc.y, { continued: true });
		doc.text(String(income.amount), 150, doc.y, { continued: true });
		doc.text(income.source || '-', 250, doc.y, { continued: true });
		doc.text(income.note || '-', 350, doc.y);
	});

	doc.end();

	return new Promise((resolve, reject) => {
		doc.on('end', () => resolve(Buffer.concat(chunks)));
		doc.on('error', reject);
	});
}
