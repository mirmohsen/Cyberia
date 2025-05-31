import { NextFunction, Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateIncomeDto, UpdateIncomeDto } from '../../dto/income.dto';
import {
	createIncome,
	findIncomes,
	updateIncomeById,
} from '../../model/finance/income.model';
import { userExistById } from '../../model/user/user.model';

export const create = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const incomeDto = plainToInstance(CreateIncomeDto, req.body);

		const errors = await validate(incomeDto);
		if (errors.length > 0) {
			res.status(400).json({
				message: 'Validation failed',
				errors: errors.map((e) => e.constraints),
			});
			return;
		}

		const userExists = await userExistById(incomeDto.user);
		if (!userExists) {
			res.status(404).json({ message: 'User ID does not exist' });
			return;
		}

		const createdIncome = await createIncome(incomeDto);
		res.status(201).json(createdIncome);
	} catch (error) {
		console.error('Create income error:', error);
		next(error);
	}
};

export const finds = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
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
			source: req.query.source as string,
			minAmount: req.query.minAmount
				? parseFloat(req.query.minAmount as string)
				: undefined,
			maxAmount: req.query.maxAmount
				? parseFloat(req.query.maxAmount as string)
				: undefined,
		};

		const result = await findIncomes(userId, page, limit, filters);
		res.status(200).json(result);
	} catch (error) {
		console.error('Controller error in finds:', error);
		next(error);
	}
};

export const update = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const incomeId = req.body.incomeId;
		if (!incomeId) {
			res.status(400).json({ message: 'Missing income ID' });
			return;
		}

		const dto = plainToInstance(UpdateIncomeDto, req.body);
		const errors = await validate(dto);
		if (errors.length > 0) {
			res.status(400).json({ message: 'Validation failed', errors });
			return;
		}

		const updatedIncome = await updateIncomeById(incomeId, dto);

		res.status(200).json(updatedIncome);
	} catch (error) {
		console.error('Update income error:', error);
		next(error);
	}
};
