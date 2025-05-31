import { Schema, model } from 'mongoose';
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
