import { ObjectId, Schema, Types, model } from 'mongoose';
import { CreateSavingGoalDto } from '../../dto/saving.dto';

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
