import { plainToInstance } from 'class-transformer';
import { NextFunction, Request, Response } from 'express';
import { CreateSavingGoalDto } from '../../dto/saving.dto';
import { validate } from 'class-validator';
import { userExistById } from '../../model/user/user.model';
import {
	createSaving,
	getSavingGoalsByUser,
} from '../../model/finance/saving.model';
import mongoose from 'mongoose';

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

export const finds = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId = req.params.userId;

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			res.status(400).json({ message: 'Invalid user ID' });
			return;
		}

		const goals = await getSavingGoalsByUser(userId);
		res.status(200).json(goals);
		return;
	} catch (error) {
		console.error('Error fetching saving goals:', error);
		next(error);
	}
};
