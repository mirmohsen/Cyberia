import { NextFunction, Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateIncomeDto } from '../../dto/income.dto';
import { createIncome } from '../../model/finance/income.model';
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
