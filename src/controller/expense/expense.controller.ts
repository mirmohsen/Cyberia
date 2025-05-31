import { plainToInstance } from 'class-transformer';
import { NextFunction, Request, Response } from 'express';
import { CreateExpenseDto } from '../../dto/expense.dto';
import { validate } from 'class-validator';
import { userExistById } from '../../model/user/user.model';
import { createExpense, findExpense } from '../../model/finance/expense.model';

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

export const finds = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const userIdParam = req.query.userId;
		if (!userIdParam || typeof userIdParam !== 'string') {
			res.status(400).json({ message: 'Invalid or missing userId' });
			return;
		}

		const userId = userIdParam;
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;

		const filters = {
			minAmount: req.query.minAmount
				? parseFloat(req.query.minAmount as string)
				: undefined,
			maxAmount: req.query.maxAmount
				? parseFloat(req.query.maxAmount as string)
				: undefined,
			startDate: req.query.startDate
				? new Date(req.query.startDate as string)
				: undefined,
			endDate: req.query.endDate
				? new Date(req.query.endDate as string)
				: undefined,
		};

		const result = await findExpense(userId, page, limit, filters);
		res.status(200).json(result);
	} catch (error) {
		console.error('Controller error in finds:', error);
		next(error);
	}
};
