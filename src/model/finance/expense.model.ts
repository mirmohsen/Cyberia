import { Schema, model } from 'mongoose';
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
