import { Request, Response } from 'express';
import { createUser, userExist } from '../../model/user/user.model';

export const signup = async (
	req: Request,
	res: Response
): Promise<Response | void> => {
	const { email, password, username } = req.body;
	const user = await userExist(email);

	if (user) {
		res.status(409).json({
			statusCode: 409,
			success: false,
			message: 'User already exists',
		});
		return;
	}

	const newUser = await createUser({ email, username, password });

	return res.status(201).json({
		statusCode: 201,
		success: true,
		data: newUser,
	});
};
