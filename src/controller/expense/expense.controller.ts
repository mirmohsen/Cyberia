import { plainToInstance } from 'class-transformer';
import { NextFunction, Request, Response } from 'express';
import { CreateExpenseDto } from '../../dto/expense.dto';
import { validate } from 'class-validator';
import { userExistById } from '../../model/user/user.model';
import { createExpense } from '../../model/finance/expense.model';

export const create = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const expenseDto = plainToInstance(CreateExpenseDto, req.body);

		const errors = await validate(expenseDto);
		if (errors.length > 0) {
			res.status(400).json({
				message: 'Validation failed',
				errors: errors.map((e) => e.constraints),
			});
			return;
		}

		const userExists = await userExistById(expenseDto.user);
		if (!userExists) {
			res.status(404).json({
				message: 'User ID does not exist',
			});
			return;
		}

		const createdExpense = await createExpense(expenseDto);
		res.status(201).json(createdExpense);
	} catch (error) {
		console.error('Create expense error', error);
		next(error);
	}
};
