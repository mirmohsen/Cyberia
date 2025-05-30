import { Schema, model } from 'mongoose';
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
