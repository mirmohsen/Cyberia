import { ObjectId, Schema, Types, model } from 'mongoose';
import { CreateSavingGoalDto, UpdateSavingGoalDto } from '../../dto/saving.dto';

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
