import { Request, Response } from 'express';
import { createUser, findUser, userExist } from '../../model/user/user.model';
import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { CreateUserDto, LoginUserDto } from '../../dto/user.dto';
import { generateToken } from '../../utils/token';
import { comparePassword } from '../../utils/bcrypt.helper';

export const signup = async (
	req: Request,
	res: Response
): Promise<Response | void> => {
	try {
		const dto = plainToInstance(CreateUserDto, req.body);
		await validateOrReject(dto);

		const { email, password, username } = dto;
		const user = await userExist(email);

		if (user) {
			return res.status(409).json({
				statusCode: 409,
				success: false,
				message: 'User already exists',
			});
		}

		const newUser = await createUser({ email, username, password });

		return res.status(201).json({
			statusCode: 201,
			success: true,
			data: newUser,
		});
	} catch (error) {
		if (Array.isArray(error)) {
			const errors = error.map((e: ValidationError) => ({
				property: e.property,
				constraints: e.constraints,
			}));

			return res.status(400).json({
				statusCode: 400,
				success: false,
				message: 'Validation failed',
				errors,
			});
		}

		console.error(error);
		return res.status(500).json({
			statusCode: 500,
			success: false,
			message: 'Internal Server Error',
		});
	}
};

export const login = async (
	req: Request,
	res: Response
): Promise<Response | void> => {
	try {
		const loginDto = plainToInstance(LoginUserDto, req.body);
		await validateOrReject(loginDto);

		const { email, password } = loginDto;

		const checkUser = await userExist(email);
		if (!checkUser) {
			return res.status(404).json({ message: 'User not found' });
		}

		const user = await findUser(email);

		const isMatch = await comparePassword(password, user?.password!);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		const token = generateToken({ id: user?._id, email: user?.email });

		return res.status(200).json({
			message: 'Login successful',
			token,
			user: {
				id: user?._id,
				email: user?.email,
				username: user?.username,
			},
		});
	} catch (error) {
		return res.status(400).json({
			message: 'Invalid input',
			errors: Array.isArray(error)
				? error.map((e) => ({
						property: e.property,
						constraints: e.constraints,
				  }))
				: error instanceof Error
				? error.message
				: 'Internal Server Error',
		});
	}
};
