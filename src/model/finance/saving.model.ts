import { ObjectId, Schema, Types, model } from 'mongoose';
import { CreateSavingGoalDto, UpdateSavingGoalDto } from '../../dto/saving.dto';
import PDFDocument from 'pdfkit';

const SavingSchema = new Schema(
	{
		user: {
			required: true,
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		title: String,
		targetAmount: Number,
		currentAmount: Number,
		deadline: Date,
		note: String,
	},
	{
		timestamps: true,
	}
);

export const savingModel = model('Saving', SavingSchema);

export async function createSaving(createSavingGoalDto: CreateSavingGoalDto) {
	const create = savingModel.create(createSavingGoalDto);
	return create;
}

export const getSavingGoalsByUser = async (userId: string) => {
	const objectUserId = new Types.ObjectId(userId);
	const goals = await savingModel
		.find({ user: objectUserId })
		.select(
			'title targetAmount currentAmount deadline note createdAt updatedAt'
		)
		.sort({ deadline: 1 })
		.lean();

	return goals.map((goal) => ({
		...goal,
		progress: goal.targetAmount
			? Math.min(
					100,
					Math.round(((goal.currentAmount as number) / goal.targetAmount) * 100)
			  )
			: null,
	}));
};

//update

export async function deleteSavingById(savingId: Types.ObjectId) {
	const result = await savingModel.findByIdAndDelete(savingId);

	return result;
}

export async function updateSavingById(
	savingId: string,
	updates: UpdateSavingGoalDto
) {
	if (!Types.ObjectId.isValid(savingId)) {
		throw new Error('Invalid savingId');
	}

	if (updates.user && !Types.ObjectId.isValid(updates.user.toString())) {
		throw new Error('Invalid user ID in updates');
	}

	const existing = await savingModel.findById(savingId);
	if (!existing) {
		throw new Error('Saving goal does not exist');
	}

	const updatedSaving = await savingModel
		.findByIdAndUpdate(
			savingId,
			{ $set: updates },
			{ new: true, runValidators: true }
		)
		.populate('user');

	return updatedSaving;
}

export async function exportSavingAsPDF(
	userId: string,
	filters?: {
		title?: string;
		minTargetAmount?: number;
		maxTargetAmount?: number;
		minCurrentAmount?: number;
		maxCurrentAmount?: number;
		startDeadline?: Date | string;
		endDeadline?: Date | string;
	}
): Promise<Buffer> {
	const objectUserId = new Types.ObjectId(userId);
	const query: any = { user: objectUserId };

	if (filters?.title) {
		query.title = { $regex: filters.title, $options: 'i' };
	}
	if (filters?.minTargetAmount || filters?.maxTargetAmount) {
		query.targetAmount = {};
		if (filters.minTargetAmount !== undefined)
			query.targetAmount.$gte = filters.minTargetAmount;
		if (filters.maxTargetAmount !== undefined)
			query.targetAmount.$lte = filters.maxTargetAmount;
	}
	if (filters?.minCurrentAmount || filters?.maxCurrentAmount) {
		query.currentAmount = {};
		if (filters.minCurrentAmount !== undefined)
			query.currentAmount.$gte = filters.minCurrentAmount;
		if (filters.maxCurrentAmount !== undefined)
			query.currentAmount.$lte = filters.maxCurrentAmount;
	}
	if (filters?.startDeadline || filters?.endDeadline) {
		query.deadline = {};
		if (filters.startDeadline)
			query.deadline.$gte = new Date(filters.startDeadline);
		if (filters.endDeadline)
			query.deadline.$lte = new Date(filters.endDeadline);
	}

	const savings = await savingModel.find(query).populate('user');

	const doc = new PDFDocument({ margin: 30 });
	const chunks: any[] = [];
	doc.on('data', (chunk) => chunks.push(chunk));
	doc.on('end', () => {});

	doc.fontSize(18).text('Saving Report', { align: 'center' });
	doc.moveDown();

	// Table header
	doc
		.fontSize(12)
		.text('Title', 50, doc.y, { continued: true })
		.text('Target', 200, doc.y, { continued: true })
		.text('Current', 280, doc.y, { continued: true })
		.text('Deadline', 360, doc.y, { continued: true })
		.text('Note', 440, doc.y);
	doc.moveDown();

	// Table rows
	savings.forEach((saving) => {
		const deadline = saving.deadline
			? new Date(saving.deadline).toLocaleDateString()
			: '-';
		doc
			.fontSize(10)
			.text(saving.title || '-', 50, doc.y, { continued: true })
			.text(String(saving.targetAmount ?? '-'), 200, doc.y, { continued: true })
			.text(String(saving.currentAmount ?? '-'), 280, doc.y, {
				continued: true,
			})
			.text(deadline, 360, doc.y, { continued: true })
			.text(saving.note || '-', 440, doc.y);
	});

	doc.end();

	return new Promise((resolve, reject) => {
		doc.on('end', () => resolve(Buffer.concat(chunks)));
		doc.on('error', reject);
	});
}
