import { plainToInstance } from 'class-transformer';
import { NextFunction, Request, Response } from 'express';
import { CreateSavingGoalDto } from '../../dto/saving.dto';
import { validate } from 'class-validator';
import { userExistById } from '../../model/user/user.model';
import { createSaving } from '../../model/finance/saving.model';

export const create = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const savingDto = plainToInstance(CreateSavingGoalDto, req.body);

		const errors = await validate(savingDto);
		if (errors.length > 0) {
			res.status(400).json({
				message: 'validation failed',
				errors: errors.map((e) => e.constraints),
			});
			return;
		}

		const userExists = await userExistById(savingDto.user);
		if (!userExists) {
			res.status(404).json({
				message: 'User ID does not exist',
			});
			return;
		}

		const createdSaving = await createSaving(savingDto);
		res.status(201).json(createdSaving);
	} catch (error) {
		console.error('Create income error:', error);
		next(error);
	}
};
